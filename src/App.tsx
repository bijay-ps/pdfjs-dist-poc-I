import './App.css';
import PDFViewer from "./PDFViewer.tsx";

function App() {

    return (
        <div>
            <h1>PDF.js in React</h1>
            <PDFViewer fileUrl={'https://api.slingacademy.com/v1/sample-data/files/just-text.pdf'}/>
        </div>
    )
}

export default App
