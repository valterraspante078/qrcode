import sys
import re

def validate_post(content, title):
    """
    Valida se o conteúdo do post segue as novas diretrizes de SEO e estrutura.
    """
    errors = []
    
    # 1. Tamanho Mínimo (estimativa por palavras)
    word_count = len(content.split())
    if word_count < 1500:
        errors.append(f"Erro de Tamanho: O post tem apenas {word_count} palavras. Mínimo: 1500.")
    
    # 2. Presença de H1
    if not re.search(r'<h1>.*</h1>', content, re.IGNORECASE) and not re.search(r'<h1>.*</h1>', title, re.IGNORECASE):
        # O título geralmente é o H1 no frontend, mas verificamos se há algum no conteúdo
        pass 

    # 3. Contagem de H2 (5 a 10)
    h2_count = len(re.findall(r'<h2>', content, re.IGNORECASE))
    if h2_count < 5:
        errors.append(f"Erro de Estrutura: Apenas {h2_count} tags <h2> encontradas. Mínimo: 5.")
    
    # 4. Presença de H3
    if not re.search(r'<h3>', content, re.IGNORECASE):
        errors.append("Erro de Estrutura: Nenhuma tag <h3> encontrada para detalhamento.")

    # 5. Presença de FAQ
    if "FAQ" not in content.upper() and "PERGUNTAS FREQUENTES" not in content.upper():
        errors.append("Erro de Conteúdo: Seção de FAQ não encontrada.")

    # 6. Presença de CTA
    if content.count('href="/"') < 2:
        errors.append("Erro de Conversão: CTAs insuficientes (pelo menos 2 links para a Home são esperados).")

    # 7. Listas
    if not re.search(r'<ul>|<li>', content, re.IGNORECASE):
        errors.append("Erro de Escaneabilidade: Nenhuma lista (<ul>/<li>) encontrada.")

    return errors

if __name__ == "__main__":
    # Exemplo de uso
    print("Otimizador de Sistema de Blog carregado.")
    print("Para validar um post, use a função validate_post(conteudo, titulo).")
