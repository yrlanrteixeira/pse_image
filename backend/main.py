from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from models import ProcessRequest, ProcessResponse, ImageData
from processor import ImageProcessor
import os
from PIL import Image
import io

app = FastAPI(title="PSE-Image Backend", version="1.0.0")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite e CRA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = ImageProcessor()

@app.get("/")
def read_root():
    return {
        "message": "PSE-Image Backend API",
        "version": "1.0.0",
        "endpoints": ["/process", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/process", response_model=ProcessResponse)
async def process_graph(request: ProcessRequest):
    """
    Processa o grafo de nós e retorna os resultados
    """
    try:
        # Converter para dicts
        nodes = [node.model_dump() for node in request.nodes]
        edges = [edge.model_dump() for edge in request.edges]

        # Processar
        results = processor.process_graph(nodes, edges)

        return ProcessResponse(results=results)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-raw")
async def upload_raw_file(file: UploadFile = File(...), width: int = 0, height: int = 0):
    """
    Faz upload de um arquivo (RAW ou imagem comum) e retorna os dados em formato RAW
    - Formatos comuns (JPG, PNG, BMP, etc.): dimensões extraídas automaticamente, convertido para escala de cinza
    - Formato RAW: requer width e height
    """
    try:
        contents = await file.read()
        filename = file.filename or ""
        file_ext = filename.lower().split('.')[-1] if '.' in filename else ""
        
        # Formatos de imagem comuns que o Pillow pode processar
        common_formats = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif', 'webp, txt']
        
        if file_ext in common_formats:
            # Processar formato de imagem comum
            try:
                # Abrir imagem com Pillow
                image = Image.open(io.BytesIO(contents))
                
                # Converter para escala de cinza (modo 'L')
                image = image.convert('L')
                
                # Extrair dimensões
                width, height = image.size
                
                # Obter pixels como lista
                pixel_data = list(image.getdata())
                
                return {
                    "width": width,
                    "height": height,
                    "data": pixel_data
                }
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro ao processar imagem: {str(e)}"
                )
        else:
            # Processar como arquivo RAW
            # Tentar primeiro como arquivo de texto (valores separados por espaços/quebras de linha)
            is_text_format = False
            try:
                text_content = contents.decode('utf-8')
                is_text_format = True
                print(f"[DEBUG] Arquivo decodificado como texto, tamanho: {len(text_content)} caracteres")
            except UnicodeDecodeError:
                print(f"[DEBUG] Não é UTF-8, processando como RAW binário")
                is_text_format = False
            
            if is_text_format:
                try:
                    # Parsear números do texto (separados por espaços, tabs, quebras de linha)
                    pixel_values = []
                    for line in text_content.split('\n'):
                        line = line.strip()
                        if line:  # Ignorar linhas vazias
                            # Dividir por espaços e converter para inteiros
                            values = [int(v.strip()) for v in line.split() if v.strip()]
                            pixel_values.extend(values)
                    
                    print(f"[DEBUG] Valores parseados: {len(pixel_values)} pixels")
                    
                    # Se conseguiu parsear valores, usar como formato texto
                    if len(pixel_values) > 0:
                        # Para arquivos de texto, SEMPRE detectar dimensões automaticamente
                        # Contar linhas não vazias e colunas na primeira linha
                        lines = [l.strip() for l in text_content.split('\n') if l.strip()]
                        detected_height = len(lines)
                        detected_width = 0
                        
                        if detected_height > 0:
                            first_line_values = [v for v in lines[0].split() if v.strip()]
                            detected_width = len(first_line_values)
                        
                        print(f"[DEBUG] Dimensões detectadas: {detected_width}×{detected_height}")
                        
                        # Validar dimensões detectadas
                        if detected_width <= 0 or detected_height <= 0:
                            raise HTTPException(
                                status_code=400,
                                detail="Não foi possível detectar dimensões do arquivo de texto."
                            )
                        
                        if detected_width * detected_height != len(pixel_values):
                            print(f"[DEBUG] ERRO: Dimensões inconsistentes!")
                            print(f"[DEBUG] Largura: {detected_width}, Altura: {detected_height}")
                            print(f"[DEBUG] Esperado: {detected_width * detected_height}, Recebido: {len(pixel_values)}")
                            raise HTTPException(
                                status_code=400,
                                detail=f"Dimensões detectadas inconsistentes: {detected_width}×{detected_height} = {detected_width * detected_height} pixels, mas arquivo contém {len(pixel_values)} pixels"
                            )
                        
                        print(f"[DEBUG] Retornando imagem {detected_width}×{detected_height}")
                        return {
                            "width": detected_width,
                            "height": detected_height,
                            "data": pixel_values
                        }
                except ValueError as e:
                    # Se falhar ao parsear números, processar como RAW binário
                    print(f"[DEBUG] Falha ao parsear valores como texto: {e}")
                    print(f"[DEBUG] Tentando processar como RAW binário...")
                    is_text_format = False
            
            # Processar como arquivo RAW binário (comportamento original)
            pixel_data = list(contents)
            
            # Validar dimensões para RAW binário
            if width <= 0 or height <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Para arquivos RAW binários, largura e altura devem ser especificadas"
                )
            
            if width * height != len(pixel_data):
                raise HTTPException(
                    status_code=400,
                    detail=f"Dimensões inválidas: {width}×{height} = {width * height} pixels, mas arquivo contém {len(pixel_data)} bytes"
                )

            return {
                "width": width,
                "height": height,
                "data": pixel_data
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
