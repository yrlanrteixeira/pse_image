import math
from typing import List, Dict, Any, Optional
from collections import deque

class ImageProcessor:


    def process_graph(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, Any]:
        """
        Processa o grafo de nós executando em ordem topológica
        Garante que dependências sejam processadas antes de seus dependentes
        """
        nodes_dict = {node['id']: node for node in nodes}

        try:
            sorted_node_ids = self.topological_sort(nodes_dict, edges)
        except Exception as e:
            return {"error": f"Erro na ordenação topológica: {str(e)}"}

        # Cache de resultados: permite que nós acessem outputs de nós anteriores
        results = {}

        for node_id in sorted_node_ids:
            node = nodes_dict[node_id]
            node_type = node['type']

            inputs = self.get_node_inputs(node_id, edges, results)

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
        Algoritmo de Kahn: ordena nós de forma que dependências sejam processadas antes
        """
        # in_degree[node] = quantas arestas entram no nó (quantos dependem dele)
        in_degree = {node_id: 0 for node_id in nodes.keys()}
        adjacency = {node_id: [] for node_id in nodes.keys()}

        for edge in edges:
            source = edge['source']
            target = edge['target']
            adjacency[source].append(target)
            in_degree[target] += 1

        # Inicia com nós que não dependem de ninguém (grau 0)
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        sorted_nodes = []

        while queue:
            current = queue.popleft()
            sorted_nodes.append(current)

            # Remove dependência dos vizinhos
            for neighbor in adjacency[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:  # Vizinho ficou sem dependências
                    queue.append(neighbor)

        # Se não processou todos os nós, existe ciclo
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
        Processa a convolução de uma imagem
        Convolução = aplicar uma máscara/kernel sobre cada pixel
        """
        # Valida se há entrada
        if not inputs or 'data' not in inputs[0]:
            return {"error": "Entrada inválida para convolução"}

        # Extrai dados da imagem de entrada
        input_image = inputs[0]
        width = input_image['width']
        height = input_image['height']
        pixels = input_image['data']  # Lista de pixels [0-255]
        
        # Obtém parâmetros do nó
        params = node.get('data', {})
        kernel_size = params.get('kernelSize', 3)  # Tamanho da janela (3x3, 5x5, etc)
        filter_type = params.get('filterType', 'convolution')  # Tipo de filtro
        
        # Redireciona para filtros especializados
        if filter_type == 'mediana':
            return self.process_median(pixels, width, height, kernel_size)
        
        if filter_type == 'laplacian':
            return self.process_laplacian(pixels, width, height)
        
        if filter_type == 'media':
            return self.process_mean(pixels, width, height, kernel_size)
        
        # Convolução com kernel customizado
        kernel = params.get('kernel', [[1, 1, 1], [1, 1, 1], [1, 1, 1]])
        divisor = params.get('divisor', 9)  # Normalização (soma dos pesos do kernel)

        output = [0] * (width * height)  # Imagem de saída
        radius = (kernel_size - 1) // 2  # Raio da janela (ex: 3x3 tem raio 1)

        # Percorre cada pixel da imagem
        for y in range(height):
            for x in range(width):
                accumulator = 0  # Acumula resultado da convolução

                # Percorre a vizinhança do kernel centrado no pixel (x, y)
                for ky in range(-radius, radius + 1):
                    yy = y + ky  # Posição Y do vizinho
                    if yy < 0 or yy >= height:  # Ignora pixels fora da imagem
                        continue

                    for kx in range(-radius, radius + 1):
                        xx = x + kx  # Posição X do vizinho
                        if xx < 0 or xx >= width:  # Ignora pixels fora da imagem
                            continue

                        # Multiplica peso do kernel pelo valor do pixel
                        kernel_value = kernel[ky + radius][kx + radius]  # Peso da máscara
                        pixel_value = pixels[yy * width + xx]  # Valor do pixel vizinho
                        accumulator += kernel_value * pixel_value  # Soma ponderada

                # Normaliza dividindo pelo divisor e limita resultado entre 0-255
                result = int(accumulator / divisor) if divisor != 0 else 0
                output[y * width + x] = max(0, min(255, result))  # Clamp [0, 255]

        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }
    
    def insertion_sort(self, arr: List[int]) -> List[int]:
        """
        Implementação manual de insertion sort para ordenar pixels
        Usado no filtro de mediana
        
        Como funciona:
        1. Começa do segundo elemento
        2. Compara com elementos anteriores
        3. Desloca elementos maiores para a direita
        4. Insere o elemento na posição correta
        
        Exemplo: [5, 2, 8, 1]
        - i=1: [2, 5, 8, 1]  (2 vai para antes do 5)
        - i=2: [2, 5, 8, 1]  (8 já está no lugar)
        - i=3: [1, 2, 5, 8]  (1 vai para o início)
        """
        sorted_arr = arr[:]  # Cria uma cópia para não modificar o original
        
        # Percorre do segundo elemento até o final
        for i in range(1, len(sorted_arr)):
            key = sorted_arr[i]  # Elemento a ser inserido na posição correta
            j = i - 1  # Índice do elemento anterior
            
            # Desloca elementos maiores uma posição à direita
            while j >= 0 and sorted_arr[j] > key:
                sorted_arr[j + 1] = sorted_arr[j]  # Move para direita
                j -= 1
            
            # Insere o elemento na posição correta
            sorted_arr[j + 1] = key
        
        return sorted_arr
    
    def process_median(self, pixels: List[int], width: int, height: int, window_size: int) -> Dict:
        """
        ═══════════════════════════════════════════════════════════════
        FILTRO DE MEDIANA - Remove ruído sal-e-pimenta
        ═══════════════════════════════════════════════════════════════
        
        O QUE FAZ:
        - Substitui cada pixel pela MEDIANA (valor do meio) dos vizinhos
        - NÃO usa máscara/kernel (é um filtro não-linear)
        
        COMO FUNCIONA:
        1. Para cada pixel, pega uma janela de vizinhos (ex: 3x3)
        2. COLETA todos os valores dos pixels
        3. ORDENA os valores
        4. PEGA o valor do MEIO (mediana)
        
        EXEMPLO (janela 3x3):
        Vizinhos: [10, 255, 30, 15, 50, 25, 30, 40, 20]
                   ↓ ordena
        Ordenado: [10, 15, 20, 25, 30, 30, 40, 50, 255]
                                    ↑
                              mediana = 30
        
        POR QUE É BOM:
        - Remove ruído sal-e-pimenta (pixels muito claros/escuros isolados)
        - PRESERVA BORDAS (não borra tanto quanto a média)
        - O valor 255 (ruído) não afeta o resultado!
        
        DIFERENÇA DA MÉDIA:
        - Média: soma tudo e divide (ruído afeta muito)
        - Mediana: pega o do meio (ruído é ignorado)
        ═══════════════════════════════════════════════════════════════
        """
        output = [0] * (width * height)  # Imagem de saída
        radius = (window_size - 1) // 2  # Raio da janela (ex: 3x3 tem raio 1)
        
        # Percorre cada pixel da imagem
        for y in range(height):
            for x in range(width):
                window_pixels = []  # Lista para coletar pixels da vizinhança
                
                # PASSO 1: Coleta todos os pixels válidos dentro da janela
                for ky in range(-radius, radius + 1):
                    yy = y + ky  # Posição Y do vizinho
                    if yy < 0 or yy >= height:  # Ignora pixels fora da imagem
                        continue
                    
                    for kx in range(-radius, radius + 1):
                        xx = x + kx  # Posição X do vizinho
                        if xx < 0 or xx >= width:  # Ignora pixels fora da imagem
                            continue
                        
                        # Adiciona o pixel à lista
                        window_pixels.append(pixels[yy * width + xx])
                
                # PASSO 2: Ordena os pixels coletados
                sorted_pixels = self.insertion_sort(window_pixels)
                
                # PASSO 3: Pega o valor do meio (mediana)
                median_index = len(sorted_pixels) // 2
                median_value = sorted_pixels[median_index]
                
                # PASSO 4: Atribui a mediana ao pixel de saída
                output[y * width + x] = median_value
        
        # Cria a máscara/janela para visualização (todos os valores são 1)
        # Representa a região de onde os pixels são coletados
        mask = [[1 for _ in range(window_size)] for _ in range(window_size)]
        
        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output,
            "mask": mask,  # Máscara da janela usada
            "maskSize": window_size  # Tamanho da janela (ex: 3, 5, 7)
        }
    
    def process_laplacian(self, pixels: List[int], width: int, height: int) -> Dict:
        """
        ═══════════════════════════════════════════════════════════════
        FILTRO LAPLACIANO - Detecta bordas
        ═══════════════════════════════════════════════════════════════
        
        O QUE FAZ:
        - Detecta BORDAS (mudanças bruscas de intensidade)
        - Usa operador de SEGUNDA DERIVADA
        - USA máscara/kernel (é um filtro linear)
        
        KERNEL LAPLACIANO 3x3:
        [ 0, -1,  0]     Significado:
        [-1,  4, -1]  →  Centro = 4 (pixel atual)
        [ 0, -1,  0]     Vizinhos = -1 (subtraem do centro)
        
        COMO FUNCIONA:
        1. Multiplica cada vizinho pelo peso do kernel
        2. Soma tudo: 4*centro - 1*cima - 1*baixo - 1*esquerda - 1*direita
        3. Se houver mudança brusca → resultado ALTO
        4. Se região uniforme → resultado próximo de ZERO
        
        EXEMPLO:
        Região uniforme (todos 100):
        [100, 100, 100]     Resultado:
        [100, 100, 100]  →  4*100 - 100 - 100 - 100 - 100 = 0
        [100, 100, 100]     (sem borda = 0)
        
        Borda (mudança de 100 para 200):
        [100, 100, 100]     Resultado:
        [100, 200, 100]  →  4*200 - 100 - 100 - 100 - 100 = 400
        [100, 100, 100]     (borda detectada = alto)
        
        POR QUE É BOM:
        - Detecta bordas em TODAS as direções
        - Realça DETALHES e CONTORNOS
        - Encontra mudanças RÁPIDAS de intensidade
        
        OBSERVAÇÃO:
        - Pode gerar valores NEGATIVOS (usamos clamping para [0, 255])
        - Sensível a RUÍDO (amplifica pequenas variações)
        ═══════════════════════════════════════════════════════════════
        """
        # Kernel Laplaciano 3x3 (máscara fixa)
        kernel = [
            [ 0, -1,  0],  # Linha superior
            [-1,  4, -1],  # Linha do meio (centro = 4)
            [ 0, -1,  0]   # Linha inferior
        ]
        
        output = [0] * (width * height)  # Imagem de saída
        radius = 1  # Kernel 3x3 tem raio 1
        
        # Percorre cada pixel da imagem
        for y in range(height):
            for x in range(width):
                accumulator = 0  # Acumula resultado da convolução
                
                # Aplica o kernel Laplaciano na vizinhança
                for ky in range(-radius, radius + 1):
                    yy = y + ky  # Posição Y do vizinho
                    if yy < 0 or yy >= height:  # Ignora pixels fora da imagem
                        continue
                    
                    for kx in range(-radius, radius + 1):
                        xx = x + kx  # Posição X do vizinho
                        if xx < 0 or xx >= width:  # Ignora pixels fora da imagem
                            continue
                        
                        # Multiplica peso do kernel pelo valor do pixel
                        kernel_value = kernel[ky + radius][kx + radius]  # Peso (-1, 0, ou 4)
                        pixel_value = pixels[yy * width + xx]  # Valor do pixel
                        accumulator += kernel_value * pixel_value  # Soma ponderada
                
                # O Laplaciano pode gerar valores negativos
                # Usamos clamping para manter valores no intervalo [0, 255]
                result = max(0, min(255, accumulator))  # Clamp [0, 255]
                output[y * width + x] = result
        
        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }
    
    def process_mean(self, pixels: List[int], width: int, height: int, window_size: int) -> Dict:
        """
        ═══════════════════════════════════════════════════════════════
        FILTRO DE MÉDIA - Suaviza a imagem (blur)
        ═══════════════════════════════════════════════════════════════
        
        O QUE FAZ:
        - Substitui cada pixel pela MÉDIA ARITMÉTICA dos vizinhos
        - PODE usar máscara/kernel (todos os pesos = 1)
        
        COMO FUNCIONA:
        1. Para cada pixel, pega uma janela de vizinhos (ex: 3x3)
        2. SOMA todos os valores
        3. DIVIDE pelo número de pixels
        4. Resultado = novo valor do pixel
        
        EXEMPLO (janela 3x3):
        Vizinhos: [10, 20, 30, 15, 50, 25, 30, 40, 20]
                   ↓ soma
        Soma = 240
                   ↓ divide por 9
        Média = 240 / 9 = 26.6 ≈ 27
        
        KERNEL EQUIVALENTE (todos os pesos iguais):
        [1, 1, 1]
        [1, 1, 1]  ÷ 9  (divide pela soma dos pesos)
        [1, 1, 1]
        
        POR QUE É BOM:
        - SUAVIZA a imagem (efeito blur)
        - Remove RUÍDO GAUSSIANO (ruído aleatório)
        - Simples e rápido
        
        DESVANTAGENS:
        - BORRA BORDAS (perde detalhes)
        - Ruído pontual (sal-e-pimenta) AFETA muito o resultado
        
        DIFERENÇA DA MEDIANA:
        - Média: todos os valores afetam igualmente (inclusive ruídos)
        - Mediana: pega o do meio (ruídos extremos são ignorados)
        
        QUANDO USAR:
        - Imagem com ruído gaussiano (aleatório)
        - Quer suavizar/desfocar a imagem
        - Não se importa em perder detalhes de bordas
        ═══════════════════════════════════════════════════════════════
        """
        output = [0] * (width * height)  # Imagem de saída
        radius = (window_size - 1) // 2  # Raio da janela (ex: 3x3 tem raio 1)
        
        # Percorre cada pixel da imagem
        for y in range(height):
            for x in range(width):
                accumulator = 0  # Acumula soma dos pixels
                count = 0  # Conta quantos pixels foram somados
                
                # PASSO 1: Soma todos os pixels válidos dentro da janela
                for ky in range(-radius, radius + 1):
                    yy = y + ky  # Posição Y do vizinho
                    if yy < 0 or yy >= height:  # Ignora pixels fora da imagem
                        continue
                    
                    for kx in range(-radius, radius + 1):
                        xx = x + kx  # Posição X do vizinho
                        if xx < 0 or xx >= width:  # Ignora pixels fora da imagem
                            continue
                        
                        # Soma o valor do pixel
                        accumulator += pixels[yy * width + xx]
                        count += 1  # Incrementa contador
                
                # PASSO 2: Calcula a média (soma / quantidade)
                mean_value = accumulator // count if count > 0 else 0
                output[y * width + x] = mean_value
        
        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }

    def process_point_operation(self, node: Dict, inputs: List) -> Dict:
        """
        Operações pontuais: aplica transformação em cada pixel independentemente
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
                output[i] = max(0, min(255, pixels[i] + brightness))  # Clamp [0, 255]

        elif operation == 'threshold':
            threshold = params.get('value', 128)
            for i in range(len(pixels)):
                output[i] = 255 if pixels[i] >= threshold else 0  # Binarização

        return {
            "type": "image",
            "width": width,
            "height": height,
            "data": output
        }

    def process_histogram(self, node: Dict, inputs: List) -> Dict:
        """
        Calcula histograma: frequência de cada intensidade (0-255)
        """
        if not inputs or 'data' not in inputs[0]:
            return {"error": "Entrada inválida para histograma"}

        pixels = inputs[0]['data']

        # histogram[i] = quantidade de pixels com intensidade i
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
        Prepara imagem para exibição e propaga dados para outros nós
        """
        if not inputs:
            return {"error": "Nenhuma entrada para exibir"}

        # Propaga a imagem inalterada para permitir encadeamento (ex: Display -> Save)
        result = {
            "type": "image",
            "width": inputs[0]['width'],
            "height": inputs[0]['height'],
            "data": inputs[0]['data']
        }
        
        print(f"[DEBUG] process_display retornando: type={result['type']}, width={result['width']}, height={result['height']}, data_length={len(result['data'])}")
        
        return result

    def process_save(self, node: Dict, inputs: List) -> Dict:
        """
        Salva imagem em formato RAW texto
        """
        if not inputs:
            return {"error": "Nenhuma entrada para salvar"}
        
        image_data = inputs[0]
        filename = node.get('data', {}).get('filename', 'output.raw')
        width = image_data.get('width', 0)
        height = image_data.get('height', 0)
        pixels = image_data.get('data', [])
        
        try:
            # Monta conteúdo: cada linha da imagem vira uma linha no arquivo (valores separados por espaço)
            lines = []
            for y in range(height):
                row = []
                for x in range(width):
                    pixel_index = y * width + x
                    if pixel_index < len(pixels):
                        row.append(str(pixels[pixel_index]))
                lines.append(' '.join(row))
            
            content = '\n'.join(lines)
            
            import os
            save_path = os.path.join('backend', 'output', filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'w') as f:
                f.write(content)
            
            return {
                "type": "save",
                "filename": filename,
                "path": save_path,
                "width": width,
                "height": height,
                "saved": True,
                "message": f"Arquivo salvo em {save_path}"
            }
        except Exception as e:
            return {
                "type": "save",
                "error": f"Erro ao salvar arquivo: {str(e)}"
            }

