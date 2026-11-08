import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';

type Props = {
    value: string;
    label: string;
};

const ICON =
    'absolute size-3.5 transition-[opacity,scale,filter] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity';

/**
 * Copies on click. Success shows at the point of action (the icon swaps
 * to a check), which is enough for something done many times a day; a
 * toast only appears when copying fails, because then the admin needs to
 * know and do something else.
 */
export function CopyButton({ value, label }: Props) {
    const [, copy] = useClipboard();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), 1500);

        return () => window.clearTimeout(timer);
    }, [copied]);

    const onCopy = async () => {
        const ok = await copy(value);
        setCopied(ok);

        if (!ok) {
            toast.error("Couldn't copy to the clipboard", {
                id: 'copy-failed',
                description:
                    'Your browser blocked it. Select the text and copy it instead.',
            });
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative size-7 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={label}
                    onClick={onCopy}
                >
                    <Copy
                        aria-hidden
                        className={cn(
                            ICON,
                            copied && 'scale-50 opacity-0 blur-[2px]',
                        )}
                    />
                    <Check
                        aria-hidden
                        className={cn(
                            ICON,
                            'text-emerald-600 dark:text-emerald-400',
                            !copied && 'scale-50 opacity-0 blur-[2px]',
                        )}
                    />
                    <span className="sr-only" aria-live="polite">
                        {copied ? 'Copied' : ''}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied' : label}</TooltipContent>
        </Tooltip>
    );
}
