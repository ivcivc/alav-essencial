/**
 * Converte uma cor hexadecimal para o formato HSL usado pelo Shadcn/UI
 * @param hex Cor hexadecimal (ex: #ffffff)
 * @returns String no formato "H S% L%" (ex: "0 0% 100%")
 */
export function hexToHSL(hex: string): string {
  // Remover o # se existir
  hex = hex.replace(/^#/, '');
  
  // Converter hex para RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Encontrar os valores máximo e mínimo de RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Calcular a luminosidade
  let l = (max + min) / 2;
  
  // Inicializar h e s
  let h = 0;
  let s = 0;
  
  // Calcular a saturação e o matiz apenas se não for um tom de cinza
  if (max !== min) {
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }
    
    h = h * 60;
  }
  
  // Converter para os valores finais
  h = Math.round(h);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  // Retornar no formato usado pelo Shadcn/UI
  return `${h} ${s}% ${l}%`;
}

/**
 * Converte uma cor hexadecimal para o formato HSL usado pelo Tailwind CSS
 * @param hex Cor hexadecimal (ex: #ffffff)
 * @returns String no formato "hsl(H, S%, L%)" (ex: "hsl(0, 0%, 100%)")
 */
export function hexToHSLString(hex: string): string {
  const hsl = hexToHSL(hex);
  return `hsl(${hsl})`;
}
