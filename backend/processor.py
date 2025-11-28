import math
from typing import List, Dict, Any, Optional
from collections import deque

class ImageProcessor:
    """
    Processador de imagens que implementa operações matemáticas manualmente
    (sem usar métodos prontos como cv2.filter2D)
    """

    def process_graph(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, Any]:
        """
        Processa o grafo de nós executando em ordem topológica
        """
        # Converter listas para dicionários indexados por ID
        nodes_dict = {node['id']: node for node in nodes}

        # Executar ordenação topológica
        try:
            sorted_node_ids = self.topological_sort(nodes_dict, edges)
        except Exception as e:
            return {"error": f"Erro na ordenação topológica: {str(e)}"}

        # Armazenar resultados intermediários
        results = {}

        # Processar cada nó em ordem
        for node_id in sorted_node_ids:
            node = nodes_dict[node_id]
            node_type = node['type']

            # Obter inputs do nó (imagens de nós anteriores)
            inputs = self.get_node_inputs(node_id, edges, results)

            # Processar baseado no tipo
            try:
                if node_type == 'RAW_READER':
                    results[node_id] = self.process_raw_reader(node, inputs)
                elif node_type == 'CONVOLUTION':
                    results[node_id] = self.process_convolution(node, inputs)
                elif node_type == 'POINT_OP':
                    results[node_id] = self.process_point_operation(node, inputs)
                elif node_type == 'DISPLAY':
                    results[node_id] = self.process_display(node, inputs)
                elif node_type == 'SAVE':
                    results[node_id] = self.process_save(node, inputs)
                elif node_type == 'HISTOGRAM':
                    results[node_id] = self.process_histogram(node, inputs)
                elif node_type == 'DIFFERENCE':
                    results[node_id] = self.process_difference(node, inputs)
                else:
                    results[node_id] = {"error": f"Tipo de nó desconhecido: {node_type}"}
            except Exception as e:
                results[node_id] = {"error": f"Erro ao processar nó {node_id}: {str(e)}"}

        return results

    def topological_sort(self, nodes: Dict[str, Any], edges: List[Dict]) -> List[str]:
        """
        Algoritmo de Kahn para ordenação topológica
        """
        # Calcular grau de entrada de cada nó
        in_degree = {node_id: 0 for node_id in nodes.keys()}
        adjacency = {node_id: [] for node_id in nodes.keys()}

        for edge in edges:
            source = edge['source']
            target = edge['target']
            adjacency[source].append(target)
            in_degree[target] += 1

        # Fila com nós sem dependências
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        sorted_nodes = []

        while queue:
            current = queue.popleft()
            sorted_nodes.append(current)

            # Reduzir grau de entrada dos vizinhos
            for neighbor in adjacency[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Verificar se há ciclos
        if len(sorted_nodes) != len(nodes):
            raise Exception("Grafo contém ciclos")

        return sorted_nodes

    def get_node_inputs(self, node_id: str, edges: List[Dict], results: Dict) -> List[Any]:
        """
        Obtém as entradas (outputs de nós anteriores) para um nó específico
        """
        inputs = []
        for edge in edges:
            if edge['target'] == node_id:
                source_id = edge['source']
                if source_id in results:
                    inputs.append(results[source_id])
        return inputs

    # ============ PROCESSAMENTO DE BLOCOS ============

    def process_raw_reader(self, node: Dict, inputs: List) -> Dict:
        """
        Processa o bloco de leitura RAW
        Os dados já vêm do frontend
        """
        data = node.get('data', {})
        return {
            "type": "image",
            "width": data.get('width', 0),
            "height": data.get('height', 0),
            "data": data.get('imageData', [])
        }

    def process_convolution(self, node: Dict, inputs: List) -> Dict:
        """
        Aplica convolução MANUAL (sem métodos prontos) ou filtro de mediana
        """
        if not inputs or 'data' not in inputs[0]:
            return {"error": "Entrada inválida para convolução"}

        input_image = inputs[0]
        width = input_image['width']
        height = input_image['height']
        pixels = input_image['data']

        params = node.get('data', {})
        kernel_size = params.get('kernelSize', 3)
        filter_type = params.get('filterType', 'convolution')
        
        # Verificar se é filtro de mediana
        if filter_type == 'median':
            return self.process_median(pixels, width, height, kernel_size)
        
        # Convolução tradicional
        kernel = params.get('kernel', [[1, 1, 1], [1, 1, 1], [1, 1, 1]])
        divisor = params.get('divisor', 9)

        # Criar array de saída
        output = [0] * (width * height)
        radius = (kernel_size - 1) // 2

        # Loop manual - convolução pixel por pixel
        for y in range(height):
            for x in range(width):
                accumulator = 0

                # Aplicar kernel
                for ky in range(-radius, radius + 1):
                    yy = y + ky
                    if yy < 0 or yy >= height:
                        continue

                    for kx in range(-radius, radius + 1):
                        xx = x + kx
                        if xx < 0 or xx >= width:
                            continue

                        # Peso do kernel
                        kernel_value = kernel[ky + radius][kx + radius]
                        # Pixel da imagem
                        pixel_value = pixels[yy * width + xx]

                        accumulator += kernel_value * pixel_value

                # Aplicar divisor e clamping
                result = int(accumulator / divisor) if divisor != 0 else 0
                output[y * width + x] = max(0, min(255, result))

        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }
    
    def insertion_sort(self, arr: List[int]) -> List[int]:
        """
        Implementação manual de insertion sort para ordenar pixels
        (sem usar sorted() ou qualquer método pronto)
        """
        # Criar cópia do array
        sorted_arr = arr[:]
        
        for i in range(1, len(sorted_arr)):
            key = sorted_arr[i]
            j = i - 1
            
            # Move elementos maiores que key uma posição à frente
            while j >= 0 and sorted_arr[j] > key:
                sorted_arr[j + 1] = sorted_arr[j]
                j -= 1
            
            sorted_arr[j + 1] = key
        
        return sorted_arr
    
    def process_median(self, pixels: List[int], width: int, height: int, window_size: int) -> Dict:
        """
        Aplica filtro de mediana MANUAL (sem métodos prontos)
        Coleta pixels da janela, ordena manualmente e pega o valor central
        """
        output = [0] * (width * height)
        radius = (window_size - 1) // 2
        
        for y in range(height):
            for x in range(width):
                # Coletar pixels da janela
                window_pixels = []
                
                for ky in range(-radius, radius + 1):
                    yy = y + ky
                    if yy < 0 or yy >= height:
                        continue
                    
                    for kx in range(-radius, radius + 1):
                        xx = x + kx
                        if xx < 0 or xx >= width:
                            continue
                        
                        window_pixels.append(pixels[yy * width + xx])
                
                # Ordenar manualmente os pixels
                sorted_pixels = self.insertion_sort(window_pixels)
                
                # Pegar valor mediano (elemento central)
                median_index = len(sorted_pixels) // 2
                median_value = sorted_pixels[median_index]
                
                output[y * width + x] = median_value
        
        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }

    def process_point_operation(self, node: Dict, inputs: List) -> Dict:
        """
        Processa operações pontuais (brilho, contraste, limiarização)
        """
        if not inputs or 'data' not in inputs[0]:
            return {"error": "Entrada inválida para operação pontual"}

        input_image = inputs[0]
        width = input_image['width']
        height = input_image['height']
        pixels = input_image['data']

        params = node.get('data', {})
        operation = params.get('operation', 'brightness')

        output = [0] * len(pixels)

        if operation == 'brightness':
            brightness = params.get('value', 0)
            for i in range(len(pixels)):
                output[i] = max(0, min(255, pixels[i] + brightness))

        # elif operation == 'contrast':
        #     contrast = params.get('value', 1.0)
        #     for i in range(len(pixels)):
        #         output[i] = max(0, min(255, int((pixels[i] - 128) * contrast + 128)))

        elif operation == 'threshold':
            threshold = params.get('value', 128)
            for i in range(len(pixels)):
                output[i] = 255 if pixels[i] >= threshold else 0

        # elif operation == 'negative':
        #     for i in range(len(pixels)):
        #         output[i] = 255 - pixels[i]

        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }

    def process_histogram(self, node: Dict, inputs: List) -> Dict:
        """
        Calcula o histograma de uma imagem
        """
        if not inputs or 'data' not in inputs[0]:
            return {"error": "Entrada inválida para histograma"}

        pixels = inputs[0]['data']

        # Calcular histograma (0-255)
        histogram = [0] * 256
        for pixel in pixels:
            histogram[pixel] += 1

        return {
            "type": "histogram",
            "data": histogram
        }

    def process_difference(self, node: Dict, inputs: List) -> Dict:
        """
        Calcula a diferença absoluta entre duas imagens
        """
        if len(inputs) < 2:
            return {"error": "Diferença requer duas imagens de entrada"}

        img1 = inputs[0]
        img2 = inputs[1]

        if img1['width'] != img2['width'] or img1['height'] != img2['height']:
            return {"error": "As imagens devem ter as mesmas dimensões"}

        width = img1['width']
        height = img1['height']
        pixels1 = img1['data']
        pixels2 = img2['data']

        output = [0] * len(pixels1)
        for i in range(len(pixels1)):
            output[i] = abs(pixels1[i] - pixels2[i])

        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }

    def process_display(self, node: Dict, inputs: List) -> Dict:
        """
        Prepara imagem para exibição
        """
        if not inputs:
            return {"error": "Nenhuma entrada para exibir"}

        return {
            "type": "display",
            "image": inputs[0]
        }

    def process_save(self, node: Dict, inputs: List) -> Dict:
        """
        Marca imagem para salvamento
        """
        if not inputs:
            return {"error": "Nenhuma entrada para salvar"}

        return {
            "type": "save",
            "filename": node.get('data', {}).get('filename', 'output.raw'),
            "image": inputs[0]
        }
