import { isBrowserFetchableUrl, isNonFetchableRemoteUrl } from '@mastra/playground-ui/utils/file';
import type { FilePart } from '@mastra/react';

import { InMessageAttachment } from './in-message-attachment';

export interface UserFilePartRendererProps {
  part: FilePart;
  size?: 'default' | 'compact';
}

const binaryDocumentMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/zip',
  'application/octet-stream',
]);

/**
 * Renders a user `MessageFactory` `File` slot. Image parts render an inline image
 * preview when the source is browser-fetchable; video, audio, and cloud-storage
 * URIs (gs://, s3://) render a placeholder chip; binary documents such as PDF
 * and Office files render as richer attachment cards; everything else renders a
 * text/document preview.
 */
export const UserFilePartRenderer = ({ part, size = 'default' }: UserFilePartRendererProps) => {
  // The declared `FilePart` type is V4-shaped (`{ mimeType, data }`), but the
  // `@mastra/react` streaming accumulator emits the V5 shape (`{ mediaType, url }`)
  // at runtime. Read both, preferring the V5/streaming shape and falling back to
  // the V4/reload shape, so streamed and reloaded messages render identically.
  const fileType = part as FilePart & { mediaType?: string; url?: string; filename?: string };
  const data = fileType.url ?? fileType.data;
  const mimeType = fileType.mediaType ?? fileType.mimeType;
  const src = typeof data === 'string' ? data : undefined;
  const isFetchableUrl = typeof data === 'string' && isBrowserFetchableUrl(data);
  const isNonFetchableUrl = typeof data === 'string' && isNonFetchableRemoteUrl(data);
  // Only use the source as the chip label when it is a real URL. Local inlined
  // media is a long `data:...;base64,...` payload that would bloat the chip
  // title/tooltip and DOM attributes.
  const fileLabel = fileType.filename ?? (isFetchableUrl || isNonFetchableUrl ? src : undefined);
  const isImage = typeof mimeType === 'string' && mimeType.startsWith('image/');
  const isVideo = typeof mimeType === 'string' && mimeType.startsWith('video/');
  const isAudio = typeof mimeType === 'string' && mimeType.startsWith('audio/');
  const isPdf = mimeType === 'application/pdf';
  const isBinaryDocument = typeof mimeType === 'string' && binaryDocumentMimeTypes.has(mimeType);

  // Cloud-storage URIs (gs://, s3://) and audio/video can't be previewed
  // in-browser — show a labeled chip instead of a broken image/preview.
  if (isPdf) {
    return (
      <InMessageAttachment
        type="document"
        contentType={mimeType}
        name={fileLabel}
        src={isFetchableUrl ? data : undefined}
        data={src}
        size={size}
      />
    );
  }

  if (isNonFetchableUrl || isVideo || isAudio || isBinaryDocument) {
    return (
      <InMessageAttachment
        type="file"
        contentType={mimeType}
        name={fileLabel}
        src={isFetchableUrl ? src : undefined}
        size={size}
      />
    );
  }

  if (isImage) {
    return <InMessageAttachment type="image" src={src} size={size} />;
  }

  return (
    <InMessageAttachment
      type="document"
      contentType={mimeType}
      src={isFetchableUrl ? data : undefined}
      data={src}
      size={size}
    />
  );
};
