# Pruebas Selenium para HR Automate Process

Este directorio contiene pruebas automatizadas con Selenium para validar las funcionalidades principales de la aplicación.

## Requisitos previos

1. Python 3.8 o superior
2. Google Chrome instalado
3. ChromeDriver compatible con tu versión de Chrome

## Instalación

1. Crear un entorno virtual:
```bash
python -m venv venv
```

2. Activar el entorno virtual:
- Windows:
```bash
.\venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

## Estructura de las pruebas

- `test_requisiciones.py`: Pruebas para el módulo de requisiciones
- `test_postulantes.py`: Pruebas para el módulo de postulantes
- `test_calificacion.py`: Pruebas para el módulo de calificación

## Ejecutar las pruebas

1. Asegúrate de que la aplicación esté corriendo en `http://localhost:3000`

2. Para ejecutar todas las pruebas:
```bash
python -m pytest
```

3. Para ejecutar un archivo específico:
```bash
python -m pytest test_requisiciones.py
```

4. Para generar un reporte HTML:
```bash
python -m pytest --html=report.html
```

## Notas importantes

- Las pruebas asumen que hay un archivo `cv_test.pdf` en la carpeta `test_files` para las pruebas de subida de CV
- Asegúrate de que el usuario esté autenticado antes de ejecutar las pruebas
- Las pruebas incluyen esperas explícitas para manejar carga asíncrona de datos 