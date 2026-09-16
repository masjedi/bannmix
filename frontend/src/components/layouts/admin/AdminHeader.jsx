import { ChevronRight, Menu, Search } from "lucide-react";

import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

const Breadcrumb = ({ items }) => (
    <nav aria-label="Breadcrumb" className="hidden md:block">
        <ol className="flex items-center gap-1.5 text-xs font-medium">
            {items.map((item, index) => (
                <li
                    key={`${item}-${index}`}
                    className="flex items-center gap-1.5"
                >
                    {index > 0 && (
                        <ChevronRight size={12} className="text-content-muted" />
                    )}

                    {index === items.length - 1 ? (
                        <span className="font-semibold text-content-secondary">
                            {item}
                        </span>
                    ) : (
                        <span className="text-content-muted">{item}</span>
                    )}
                </li>
            ))}
        </ol>
    </nav>
);

const SearchButton = ({ onOpen }) => (
    <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 min-w-[190px] items-center gap-2.5 rounded-lg border border-line bg-theme-surface px-3.5 text-sm text-content-muted transition hover:border-line-strong hover:text-content-secondary"
    >
        <Search size={14} className="shrink-0" />
        <span className="hidden sm:inline">Quick search…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-line bg-theme-page px-1.5 py-0.5 text-[10px] font-semibold text-content-muted sm:inline">
            Ctrl K
        </kbd>
    </button>
);

const AdminHeader = ({
    crumbs,
    currentPage,
    onOpenSidebar,
    onOpenSearch,
    user,
    onLogout,
    loggingOut,
    onOpenUserPanel,
}) => {
    return (
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-theme-surface/95 px-4 shadow-sm shadow-slate-200/40 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-content-secondary transition hover:bg-theme-page lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={18} />
                </button>

                <div className="min-w-0 border-l-2 border-brand-green pl-3">
                    <Breadcrumb items={crumbs} />
                    <p className="mt-0.5 truncate text-lg font-bold tracking-tight text-content sm:text-xl">
                        {currentPage}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:block">
                    <SearchButton onOpen={onOpenSearch} />
                </div>

                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-theme-surface text-content-secondary transition hover:border-line-strong hover:text-content md:hidden"
                    aria-label="Quick search"
                >
                    <Search size={15} />
                </button>

                <NotificationBell />

                <UserMenu
                    user={user}
                    onLogout={onLogout}
                    loggingOut={loggingOut}
                    onOpenPanel={onOpenUserPanel}
                />
            </div>
        </header>
    );
};

export default AdminHeader;
