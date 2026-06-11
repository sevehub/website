
from PIL import Image, ImageDraw
import base64
from io import BytesIO

def create_ruled_paper(width, height, line_spacing=20, filename=None):
    # Create image with white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw blue horizontal lines edge-to-edge
    blue = (0, 0, 255)
    for y in range(line_spacing, height, line_spacing):
        draw.line([(0, y), (width, y)], fill=blue, width=1)
    
    # Convert to Base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    base64_str = base64.b64encode(buffer.getvalue()).decode()
    
    if filename:
        with open(filename, 'w') as f:
            f.write(f'<img src="data:image/png;base64,{base64_str}" alt="Ruled paper">')
    
    return base64_str

# Generate both sizes
# Assuming 96 DPI, 3x5" = 288x480px, 4x6" = 384x576px
base64_3x5 = create_ruled_paper(288, 480, line_spacing=20, filename='ruled_3x5.html')
base64_4x6 = create_ruled_paper(384, 576, line_spacing=20, filename='ruled_4x6.html')

print(f"3x5 Base64:\n{base64_3x5}\n")
print(f"4x6 Base64:\n{base64_4x6}\n")
