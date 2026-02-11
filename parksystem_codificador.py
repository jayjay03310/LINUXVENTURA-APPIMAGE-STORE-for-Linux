import tkinter as tk
from tkinter import messagebox
import random
import string

def park_system_encode(url):
    """
    Sistema Park System Moderno - Codificação
    - Insere um caractere aleatório (letra/número) após cada caractere do URL
    - Adiciona um marcador especial no final para facilitar a decodificação futura
    """
    encoded = ""
    for char in url:
        encoded += char
        # Adiciona um caractere aleatório (letra ou número)
        random_char = random.choice(string.ascii_letters + string.digits)
        encoded += random_char
    
    # Adiciona um marcador especial para identificar o final da codificação
    # O marcador contém um caractere especial e o tamanho original
    marker = f"~{len(url)}~"
    return encoded + marker

class ParkSystemEncoder:
    def __init__(self, root):
        self.root = root
        self.root.title("Park System Moderno - Codificador")

        tk.Label(root, text="URL Original:").pack(pady=5)
        self.url_entry = tk.Entry(root, width=60)
        self.url_entry.pack(pady=5)

        tk.Button(root, text="Codificar", command=self.encode_url).pack(pady=10)

        tk.Label(root, text="URL Codificada:").pack(pady=5)
        self.result_text = tk.Text(root, height=6, width=60)
        self.result_text.pack(pady=5)

        # Adiciona barra de rolagem
        scrollbar = tk.Scrollbar(root, orient="vertical", command=self.result_text.yview)
        scrollbar.pack(side="right", fill="y")
        self.result_text.configure(yscrollcommand=scrollbar.set)

    def encode_url(self):
        url = self.url_entry.get()
        if not url:
            messagebox.showerror("Erro", "Por favor, insira uma URL")
            return

        encoded = park_system_encode(url)
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, encoded)

if __name__ == "__main__":
    root = tk.Tk()
    app = ParkSystemEncoder(root)
    root.mainloop()