import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from test_base import TestBaseCalificacion

class TestCalificacion(TestBaseCalificacion):
    def setUp(self):
        super().setUp()
        self.driver.get("http://localhost:3000/calificacion")
        self.driver.maximize_window()
        time.sleep(2)  # Esperar a que cargue la página

    def tearDown(self):
        self.driver.quit()

    def test_calificar_postulante(self):
        # Test para calificar un postulante
        driver = self.driver
        
        # Esperar a que la tabla cargue
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )

        # Hacer clic en el botón de calificar del primer postulante
        calificar_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Calificar')]")
        calificar_button.click()

        # Esperar a que aparezca el formulario de calificación
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "puntajeP1"))
        )

        # Ingresar calificaciones
        puntajes = {
            "puntajeP1": "15",
            "puntajeP2": "16",
            "puntajeP3": "17",
            "puntajeP4": "18"
        }

        for campo, valor in puntajes.items():
            input_field = driver.find_element(By.ID, campo)
            input_field.clear()
            input_field.send_keys(valor)

        # Guardar calificaciones
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Guardar')]")
        submit_button.click()

        # Verificar que se actualizó el estado
        time.sleep(2)
        tabla = driver.find_element(By.TAG_NAME, "table")
        self.assertIn("Aprobado", tabla.text)

    def test_validacion_puntajes(self):
        # Test para validar rango de puntajes
        driver = self.driver
        
        # Abrir formulario de calificación
        calificar_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Calificar')]"))
        )
        calificar_button.click()

        # Intentar ingresar puntajes inválidos
        puntajes_invalidos = {
            "puntajeP1": "25",  # Mayor a 20
            "puntajeP2": "-1",  # Menor a 0
            "puntajeP3": "abc",  # No numérico
            "puntajeP4": "13"   # Menor a 14
        }

        for campo, valor in puntajes_invalidos.items():
            input_field = driver.find_element(By.ID, campo)
            input_field.clear()
            input_field.send_keys(valor)

        # Intentar guardar
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Guardar')]")
        submit_button.click()

        # Verificar que aparezca mensaje de error
        time.sleep(1)
        alert = driver.switch_to.alert
        self.assertIn("valores entre 0 y 20", alert.text)
        alert.accept()

    def test_ver_cv(self):
        # Test para verificar la visualización del CV
        driver = self.driver
        
        # Esperar a que aparezca el botón de ver CV
        ver_cv_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Ver CV')]"))
        )
        ver_cv_button.click()

        # Verificar que se abra el diálogo con el CV
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "iframe"))
        )

        # Verificar que el iframe existe y tiene src
        iframe = driver.find_element(By.TAG_NAME, "iframe")
        self.assertTrue(iframe.get_attribute("src") != "")

if __name__ == '__main__':
    unittest.main() 