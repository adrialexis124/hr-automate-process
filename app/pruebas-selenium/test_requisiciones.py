import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from test_base import TestBaseRequisiciones

class TestRequisiciones(TestBaseRequisiciones):
    def setUp(self):
        super().setUp()
        self.driver.get("http://localhost:3000/solicitantes/requisiciones")
        time.sleep(2)

    def tearDown(self):
        self.driver.quit()

    def test_crear_requisicion(self):
        # Test para crear una nueva requisición
        driver = self.driver
        
        # Llenar el formulario
        cargo_input = driver.find_element(By.ID, "cargo")
        cargo_input.send_keys("Desarrollador Python")

        area_input = driver.find_element(By.ID, "area")
        area_input.send_keys("TICS")

        jefe_input = driver.find_element(By.ID, "jefeInmediato")
        jefe_input.send_keys("Juan Pérez")

        funciones_input = driver.find_element(By.ID, "funciones")
        funciones_input.send_keys("Desarrollo de aplicaciones web con Python y React")

        # Click en el botón de enviar
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Enviar Requisición')]")
        submit_button.click()

        # Esperar a que la tabla se actualice
        time.sleep(2)

        # Verificar que la requisición aparezca en la tabla
        tabla = driver.find_element(By.TAG_NAME, "table")
        self.assertIn("Desarrollador Python", tabla.text)
        self.assertIn("TICS", tabla.text)
        self.assertIn("Juan Pérez", tabla.text)

    def test_campos_requeridos(self):
        # Test para verificar campos requeridos
        driver = self.driver
        
        # Intentar enviar el formulario vacío
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Enviar Requisición')]")
        submit_button.click()

        # Verificar que los campos requeridos muestren error
        cargo_input = driver.find_element(By.ID, "cargo")
        self.assertEqual(cargo_input.get_attribute("validationMessage"), "Please fill out this field.")

    def test_filtro_tabla(self):
        # Test para verificar que la tabla muestra las requisiciones
        driver = self.driver
        
        # Esperar a que la tabla cargue
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )

        # Verificar que la tabla tenga encabezados correctos
        headers = driver.find_elements(By.TAG_NAME, "th")
        header_texts = [header.text for header in headers]
        expected_headers = ["ID", "Cargo", "Jefe Inmediato", "Área", "Etapa", "Funciones", "Estado", "Acciones"]
        
        for expected in expected_headers:
            self.assertIn(expected, header_texts)

if __name__ == '__main__':
    unittest.main() 