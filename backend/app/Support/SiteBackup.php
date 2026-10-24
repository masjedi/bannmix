<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use ZipArchive;

class SiteBackup
{
    /**
     * Build a zip of the full database plus public uploads.
     * The caller must delete the returned file after it is sent.
     */
    public function createArchive(): string
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('PHP ZipArchive is not available on this server.');
        }

        $directory = storage_path('app/private/backups');

        if (! is_dir($directory) && ! mkdir($directory, 0700, true) && ! is_dir($directory)) {
            throw new RuntimeException('Could not create the backup directory.');
        }

        if (! is_writable($directory)) {
            throw new RuntimeException('The backup directory is not writable.');
        }

        $stamp = now()->format('Y-m-d-His').'-'.bin2hex(random_bytes(4));
        $zipPath = $directory.DIRECTORY_SEPARATOR.'banmix-backup-'.$stamp.'.zip';
        $sqlPath = $directory.DIRECTORY_SEPARATOR.'database-'.$stamp.'.sql';
        $zip = null;
        $zipOpen = false;

        try {
            $this->writeSql($sqlPath);

            $zip = new ZipArchive();
            $opened = $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            if ($opened !== true) {
                throw new RuntimeException('Could not create the backup archive.');
            }
            $zipOpen = true;

            if (! $zip->addFile($sqlPath, 'database.sql')) {
                throw new RuntimeException('Could not add the database dump to the backup.');
            }

            $this->addPublicFiles($zip);

            if (! $zip->close()) {
                throw new RuntimeException('Could not finish the backup archive.');
            }
            $zipOpen = false;
        } catch (\Throwable $exception) {
            // addFile() reads sources when the ZIP is closed. Discard queued
            // entries before deleting sources, so destruction cannot retry them.
            if ($zipOpen && $zip !== null) {
                $zip->unchangeAll();
                $zip->close();
                $zipOpen = false;
            }

            if (is_file($zipPath)) {
                unlink($zipPath);
            }

            throw $exception instanceof RuntimeException
                ? $exception
                : new RuntimeException('Could not create the backup.', 0, $exception);
        } finally {
            if (is_file($sqlPath)) {
                unlink($sqlPath);
            }
        }

        return $zipPath;
    }

    private function writeSql(string $path): void
    {
        $handle = fopen($path, 'wb');

        if ($handle === false) {
            throw new RuntimeException('Could not write the database dump.');
        }

        try {
            $tables = $this->tableNames();

            $this->writeLine($handle, '-- BannMix full database backup');
            $this->writeLine($handle, '-- Generated: '.now()->toIso8601String());
            $this->writeLine($handle, '-- Database: '.DB::getDatabaseName());
            $this->writeLine($handle, '-- Tables: '.count($tables));
            $this->writeLine($handle, '-- Private. Includes structure and all rows. Do not email this file.');
            $this->writeLine($handle, 'SET NAMES utf8mb4;');
            $this->writeLine($handle, 'SET FOREIGN_KEY_CHECKS=0;');
            $this->writeLine($handle, "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';");
            $this->writeLine($handle, '');

            foreach ($tables as $table) {
                $this->dumpTable($handle, $table);
            }

            $this->writeLine($handle, 'SET FOREIGN_KEY_CHECKS=1;');
        } finally {
            fclose($handle);
        }
    }

    /**
     * @return list<string>
     */
    private function tableNames(): array
    {
        $schema = null;

        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            $database = DB::getDatabaseName();
            $schema = $database !== '' ? $database : null;
        }

        $names = Schema::getTableListing($schema, false);

        $names = array_values(array_filter(
            $names,
            fn (string $name) => $name !== ''
                && ! str_starts_with($name, 'sqlite_')
                && Schema::hasTable($name)
        ));

        sort($names);

        return $names;
    }

    /**
     * @param  resource  $handle
     */
    private function dumpTable($handle, string $table): void
    {
        $this->writeLine($handle, '-- Table: '.$table);
        $this->writeLine($handle, 'DROP TABLE IF EXISTS '.$this->quoteIdentifier($table).';');

        $create = $this->createStatement($table);

        if ($create !== null) {
            $this->writeLine($handle, $create);
            $this->writeLine($handle, '');
        }

        $columns = Schema::getColumnListing($table);

        if ($columns === []) {
            return;
        }

        $quotedColumns = implode(', ', array_map(
            fn (string $column) => $this->quoteIdentifier($column),
            $columns
        ));
        $order = in_array('id', $columns, true) ? 'id' : $columns[0];

        foreach (DB::table($table)->orderBy($order)->cursor() as $row) {
            $values = [];

            foreach ($columns as $column) {
                $values[] = $this->quoteValue($row->{$column} ?? null);
            }

            $this->writeLine(
                $handle,
                'INSERT INTO '.$this->quoteIdentifier($table)
                .' ('.$quotedColumns.') VALUES ('.implode(', ', $values).');'
            );
        }

        $this->writeLine($handle, '');
    }

    private function createStatement(string $table): ?string
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            $rows = DB::select('SHOW CREATE TABLE '.$this->quoteIdentifier($table));
            $row = (array) ($rows[0] ?? []);
            $statement = $row['Create Table'] ?? null;

            return is_string($statement) ? rtrim($statement, " \t\n\r;").';' : null;
        }

        if ($driver === 'sqlite') {
            $row = DB::selectOne(
                "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
                [$table]
            );
            $statement = $row->sql ?? null;

            return is_string($statement) && $statement !== ''
                ? rtrim($statement, " \t\n\r;").';'
                : null;
        }

        return null;
    }

    private function addPublicFiles(ZipArchive $zip): void
    {
        $disk = Storage::disk('public');

        foreach ($disk->allFiles() as $relative) {
            $name = basename(str_replace('\\', '/', $relative));

            if ($name === '' || str_starts_with($name, '.')) {
                continue;
            }

            $absolute = $disk->path($relative);

            if (! is_file($absolute)) {
                continue;
            }

            $entry = 'storage/'.str_replace('\\', '/', $relative);

            if (! $zip->addFile($absolute, $entry)) {
                throw new RuntimeException('Could not add an uploaded file to the backup.');
            }
        }
    }

    /**
     * @param  resource  $handle
     */
    private function writeLine($handle, string $line): void
    {
        if (fwrite($handle, $line."\n") === false) {
            throw new RuntimeException('Could not write the database dump.');
        }
    }

    private function quoteIdentifier(string $name): string
    {
        return '`'.str_replace('`', '``', $name).'`';
    }

    private function quoteValue(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_int($value)) {
            return (string) $value;
        }

        if (is_float($value)) {
            return is_finite($value) ? (string) $value : 'NULL';
        }

        return DB::getPdo()->quote((string) $value);
    }
}
