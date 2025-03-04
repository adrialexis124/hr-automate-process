import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
import os
from test_base import TestBasePostulante

class TestPostulantes(TestBasePostulante):
    def setUp(self):
        super().setUp()
        self.driver.get("http://localhost:3000/postulantes/portal")
        self.driver.maximize_window()
        time.sleep(2)  # Esperar a que cargue la página

    def tearDown(self):
        self.driver.quit()

    def test_aplicar_posicion(self):
        # Test para aplicar a una posición
        driver = self.driver
        
        # Esperar a que aparezca el botón de aplicar
        aplicar_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Aplicar Posición')]"))
        )
        aplicar_button.click()

        # Esperar a que aparezca el formulario
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "nombre"))
        )

        # Llenar el formulario
        nombre_input = driver.find_element(By.ID, "nombre")
        nombre_input.send_keys("Juan Candidato")

        telefono_input = driver.find_element(By.ID, "telefono")
        telefono_input.send_keys("1234567890")

        experiencia_input = driver.find_element(By.ID, "experiencia")
        experiencia_input.send_keys("5 años de experiencia en desarrollo")

        # Subir CV
        cv_input = driver.find_element(By.ID, "cv")
        cv_path = os.path.abspath("app/pruebas-selenium/test_files/cv_test.pdf")
        cv_input.send_keys(cv_path)

        # Enviar postulación
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Enviar postulación')]")
        submit_button.click()

        # Esperar mensaje de éxito o verificar que el diálogo se cierre
        time.sleep(2)
        dialogs = driver.find_elements(By.CLASS_NAME, "dialog-content")
        self.assertEqual(len(dialogs), 0)  # El diálogo debe haberse cerrado

    def test_verificar_requisitos(self):
        # Test para verificar campos requeridos
        driver = self.driver
        
        # Abrir diálogo de postulación
        aplicar_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Aplicar Posición')]"))
        )
        aplicar_button.click()

        # Intentar enviar sin llenar campos
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Enviar postulación')]")
        submit_button.click()

        # Verificar mensajes de error
        nombre_input = driver.find_element(By.ID, "nombre")
        self.assertEqual(nombre_input.get_attribute("validationMessage"), "Please fill out this field.")

    def test_filtro_requisiciones(self):
        # Test para verificar que solo se muestran requisiciones publicadas
        driver = self.driver
        
        # Esperar a que la tabla cargue
        tabla = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )

        # Verificar que todas las requisiciones mostradas tengan etapa "Publicado"
        filas = tabla.find_elements(By.TAG_NAME, "tr")[1:]  # Excluir encabezados
        for fila in filas:
            celdas = fila.find_elements(By.TAG_NAME, "td")
            etapa = celdas[4].text  # Columna de etapa
            self.assertEqual(etapa, "Publicado")

if __name__ == '__main__':
    unittest.main() 