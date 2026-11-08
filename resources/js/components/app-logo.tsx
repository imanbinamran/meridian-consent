import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ms-1 grid flex-1 text-start text-sm">
                <span className="truncate leading-tight font-semibold">
                    Meridian
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Admin
                </span>
            </div>
        </>
    );
}
