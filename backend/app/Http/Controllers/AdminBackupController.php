<?php

namespace App\Http\Controllers;

use App\Support\SiteBackup;
use RuntimeException;

class AdminBackupController extends Controller
{
    public function download(SiteBackup $backup)
    {
        try {
            $path = $backup->createArchive();
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'message' => $exception->getMessage(),
            ], 500);
        }

        $filename = 'banmix-backup-'.now()->format('Y-m-d').'.zip';

        return response()
            ->download($path, $filename, [
                'Content-Type' => 'application/zip',
                'Cache-Control' => 'no-store, private',
            ])
            ->deleteFileAfterSend(true);
    }
}
