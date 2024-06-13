// types/pdfjs-dist-web.d.ts
declare module 'pdfjs-dist/web/pdf_viewer' {
    import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

    export class PDFViewer {
        constructor(options: { container: HTMLElement });
        setDocument(pdf: PDFDocumentProxy): void;
    }

    export class PDFViewerApplication {
        static pdfViewer: PDFViewer;
    }
}