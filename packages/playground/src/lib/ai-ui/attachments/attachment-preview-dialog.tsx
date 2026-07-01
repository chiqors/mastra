import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogBody,
} from '@mastra/playground-ui/components/Dialog';
import { File as FileIcon, FileAudio, FileText, FileVideo } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PdfEntryProps {
  data: string;
  url?: string;
  name?: string;
}

const ctaClassName = 'h-full w-full flex items-center justify-center';

export const PdfEntry = ({ data, url, name = 'PDF document' }: PdfEntryProps) => {
  const [open, setOpen] = useState(false);
  const displayName = fileDisplayName(name);

  const card = (
    <div
      className="flex min-w-0 items-center gap-3 rounded-xl border border-border1 bg-surface2 px-3 py-2 text-left text-neutral6 transition-colors hover:bg-surface3"
      title={displayName}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface4">
        <FileText className="size-4 shrink-0 text-accent2" aria-label="View PDF" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-neutral6">{displayName}</div>
        <div className="truncate text-xs text-neutral4">PDF</div>
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} className="block w-full" target="_blank" rel="noreferrer noopener">
        {card}
      </a>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="block w-full" type="button">
        {card}
      </button>

      <PdfPreviewDialog data={data} open={open} onOpenChange={setOpen} />
    </>
  );
};

interface PdfPreviewDialogProps {
  data: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PdfPreviewDialog = ({ data, open, onOpenChange }: PdfPreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>PDF preview</DialogTitle>
          <DialogDescription>Preview of the PDF document</DialogDescription>
        </DialogHeader>
        <DialogBody>{open && <iframe src={data} width="100%" height="600px"></iframe>}</DialogBody>
      </DialogContent>
    </Dialog>
  );
};

interface FileChipEntryProps {
  /** Display label (usually the filename or URL). */
  name: string;
  /** A browser-fetchable URL (http/https) to link out to, when available. */
  url?: string;
  /** MIME type used to pick a representative icon. */
  contentType?: string;
  /** Visual density for composer thumbnails versus in-message chips. */
  variant?: 'compact' | 'full';
}

/** Picks an icon (and a11y label) representing the file's media type. */
const iconForContentType = (contentType?: string) => {
  if (contentType?.startsWith('video/')) return { Icon: FileVideo, label: 'Video file' };
  if (contentType?.startsWith('audio/')) return { Icon: FileAudio, label: 'Audio file' };
  if (contentType?.startsWith('text/') || contentType === 'application/pdf')
    return { Icon: FileText, label: 'Document file' };
  return { Icon: FileIcon, label: 'File' };
};

const fileTypeLabel = (contentType?: string) => {
  if (contentType?.startsWith('video/')) return 'Video';
  if (contentType?.startsWith('audio/')) return 'Audio';
  if (contentType === 'application/pdf') return 'PDF';
  if (contentType?.startsWith('text/')) return 'Text';
  if (contentType?.includes('spreadsheet') || contentType?.includes('excel')) return 'Spreadsheet';
  if (contentType?.includes('presentation') || contentType?.includes('powerpoint')) return 'Presentation';
  if (contentType?.includes('wordprocessingml') || contentType === 'application/msword') return 'Document';
  return 'File';
};

const fileDisplayName = (name: string) => {
  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(name)) {
      const url = new URL(name);
      const segment = url.pathname.split('/').filter(Boolean).pop();
      return segment || url.hostname || name;
    }
  } catch {
    return name;
  }

  return name;
};

/**
 * Placeholder chip for media the browser cannot preview inline — e.g. video, or
 * any cloud-storage URI (`gs://`, `s3://`) that only the model provider can fetch
 * server-side. The icon reflects the file's media type. Links out when the URL is
 * browser-fetchable (http/https).
 */
export const FileChipEntry = ({ name, url, contentType, variant = 'compact' }: FileChipEntryProps) => {
  const { Icon, label } = iconForContentType(contentType);
  const displayName = fileDisplayName(name);
  const kindLabel = fileTypeLabel(contentType);
  const icon = <Icon className={variant === 'full' ? 'size-4 text-accent2 shrink-0' : 'text-accent2'} aria-label={label} />;
  const content =
    variant === 'full' ? (
      <div
        className="flex min-w-0 items-center gap-3 rounded-xl border border-border1 bg-surface2 px-3 py-2 text-left text-neutral6 transition-colors hover:bg-surface3"
        title={displayName}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface4">{icon}</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-neutral6">{displayName}</div>
          <div className="truncate text-xs text-neutral4">{kindLabel}</div>
        </div>
      </div>
    ) : (
      <div className={ctaClassName} title={displayName}>
        {icon}
      </div>
    );

  if (url) {
    return (
      <a
        href={url}
        className={variant === 'full' ? 'block w-full' : ctaClassName}
        target="_blank"
        rel="noreferrer noopener"
        title={displayName}
      >
        {content}
      </a>
    );
  }

  return content;
};

interface ImageEntryProps {
  src: string;
}

export const ImageEntry = ({ src }: ImageEntryProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} type="button" className={ctaClassName}>
        <img src={src} className="aspect-square h-full w-full object-cover" alt="Preview" />
      </button>
      <ImagePreviewDialog src={src} open={open} onOpenChange={setOpen} />
    </>
  );
};

interface ImagePreviewDialogProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImagePreviewDialog = ({ src, open, onOpenChange }: ImagePreviewDialogProps) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    const image = new Image();
    image.onload = () => {
      setDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.src = src;
  }, [open, src]);

  const maxViewportWidth = 960;
  const maxViewportHeight = 720;
  const width = dimensions?.width ?? 640;
  const height = dimensions?.height ?? 480;
  const scale = Math.min(maxViewportWidth / width, maxViewportHeight / height, 1);
  const fittedWidth = Math.max(Math.round(width * scale), 240);
  const fittedHeight = Math.max(Math.round(height * scale), 240);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-fit max-w-[min(96vw,1000px)]">
        <DialogHeader>
          <DialogTitle>Image preview</DialogTitle>
          <DialogDescription>Preview of the image</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex items-center justify-center p-4 max-h-[80vh] overflow-auto">
          {open && (
            <img
              src={src}
              alt="Image"
              width={fittedWidth}
              height={fittedHeight}
              className="block max-w-[min(96vw,960px)] max-h-[72vh] object-contain"
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

interface TxtEntryProps {
  data: string;
}

export const TxtEntry = ({ data }: TxtEntryProps) => {
  const [open, setOpen] = useState(false);

  // assistant-ui wraps txt related files with something like <attachment name=text.txt>
  // We remove the <attachment> tag and everything inside it
  const formattedContent = data.replace(/<attachment[^>]*>/, '').replace(/<\/attachment>/g, '');

  return (
    <>
      <button onClick={() => setOpen(true)} className={ctaClassName} type="button">
        <FileText className="text-neutral3" />
      </button>
      <TxtPreviewDialog data={formattedContent} open={open} onOpenChange={setOpen} />
    </>
  );
};

interface TxtPreviewDialogProps {
  data: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TxtPreviewDialog = ({ data, open, onOpenChange }: TxtPreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Text preview</DialogTitle>
          <DialogDescription>Preview of the text file</DialogDescription>
        </DialogHeader>
        <DialogBody>{open && <div className="whitespace-pre-wrap">{data}</div>}</DialogBody>
      </DialogContent>
    </Dialog>
  );
};
