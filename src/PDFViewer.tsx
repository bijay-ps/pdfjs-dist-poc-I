import React, { useEffect, useRef, useState } from 'react';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import * as pdfjsLib from 'pdfjs-dist';
// Ensure the worker is loaded
import './pdf-worker';

type Annotation = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const PDFViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const textLayerRef = useRef<HTMLDivElement | null>(null);
    const annotationLayerRef = useRef<HTMLDivElement | null>(null);
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
    const [scale, setScale] = useState(1.5);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const renderPageRef = useRef<(pageNum: number) => Promise<void>>(() => Promise.resolve());

    useEffect(() => {
        const loadDocument = async () => {
            try {
                const loadingTask = getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                setPdfDocument(pdf);
            } catch (error) {
                console.error('Error loading PDF document:', error);
            }
        };

        loadDocument();
    }, [fileUrl]);

    useEffect(() => {
        const renderPage = async (pageNum: number) => {
            if (!pdfDocument || !canvasRef.current || !textLayerRef.current || !annotationLayerRef.current) return;

            const page = await pdfDocument.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                };

                await page.render(renderContext).promise;

                // Clear existing text-layer content
                textLayerRef.current.innerHTML = '';

                // Render text layer
                const textLayer = textLayerRef.current;
                textLayer.style.height = `${viewport.height}px`;
                textLayer.style.width = `${viewport.width}px`;
                textLayer.style.setProperty('--scale-factor', String(scale));

                const textContentSource = await page.getTextContent();
                const textLayerRenderTask = pdfjsLib.renderTextLayer({
                    textContentSource,
                    container: textLayer,
                    viewport: viewport,
                    textDivs: [],
                });

                await textLayerRenderTask.promise;

                Array.from(textLayer.children).forEach((textDiv) => {
                    textDiv.dataset.pageNum = String(pageNum);
                });

                // Render annotation layer
                const pdfAnnotations = await page.getAnnotations();
                const annotationLayer = annotationLayerRef.current;
                annotationLayer.style.height = `${viewport.height}px`;
                annotationLayer.style.width = `${viewport.width}px`;
                annotationLayer.style.setProperty('--scale-factor', String(scale));

                pdfjsLib.AnnotationLayer.render({
                    viewport: viewport,
                    div: annotationLayer,
                    annotations: pdfAnnotations,
                    page: page,
                    linkService: null,
                    renderInteractiveForms: false,
                });

                // Render custom annotations
                renderCustomAnnotations(context, annotations);
            }
        };

        if (pdfDocument) {
            renderPage(1);
        }

        renderPageRef.current = renderPage;
    }, [pdfDocument, scale, annotations]);

    const renderCustomAnnotations = (context: CanvasRenderingContext2D, annotations: Annotation[]) => {
        annotations.forEach((annotation) => {
            context.strokeStyle = 'red';
            context.lineWidth = 2;
            context.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        });
    };

    return (
        <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }}  />
            <div ref={textLayerRef} className="textLayer" style={{ position: 'absolute', top: 0, left: 0 }} />
            <div ref={annotationLayerRef} className="annotationLayer" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </div>
    );
};

export default PDFViewer;
