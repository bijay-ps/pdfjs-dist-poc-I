import './App.css';
import PDFViewer from "./PDFViewer.tsx";

function App() {

    return (
        <div>
            <h1>PDF.js in React</h1>
            <PDFViewer fileUrl={'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'}/>
        </div>
    )
}

export default App
