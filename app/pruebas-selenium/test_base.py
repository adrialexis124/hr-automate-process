import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestBase(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.fill_login_form()
        time.sleep(2)

    def tearDown(self):
        self.driver.quit()

    def fill_login_form(self):
        # Navegar a la página principal (el Authenticator se muestra automáticamente)
        self.driver.get("http://localhost:3000")
        
        # Esperar a que el formulario de login esté presente
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-amplify-authenticator-signin]"))
        )

        # Encontrar los campos de email y password
        email_input = self.driver.find_element(By.CSS_SELECTOR, 'input[name="username"]')
        password_input = self.driver.find_element(By.CSS_SELECTOR, 'input[name="password"]')
        
        # Llenar con las credenciales específicas del tipo de usuario
        email_input.send_keys(self.get_email())
        password_input.send_keys(self.get_password())

        # Encontrar y hacer clic en el botón de Sign In
        sign_in_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[type="submit"]'))
        )
        sign_in_button.click()

        # Esperar a que se complete el login verificando que el Authenticator desaparezca
        WebDriverWait(self.driver, 10).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-amplify-authenticator-signin]"))
        )

    def get_email(self):
        raise NotImplementedError("Las clases hijas deben implementar get_email")

    def get_password(self):
        raise NotImplementedError("Las clases hijas deben implementar get_password")

class TestBaseCalificacion(TestBase):
    def get_email(self):
        return "rrhh@mail.com"  # Email del usuario de RRHH para calificación

    def get_password(self):
        return "Adrian29."  # Contraseña del usuario de RRHH

class TestBasePostulante(TestBase):
    def get_email(self):
        return "postulante@example.com"  # Email del usuario postulante

    def get_password(self):
        return "Adrian29."  # Contraseña del usuario postulante

class TestBaseRequisiciones(TestBase):
    def get_email(self):
        return "solicitantes@mail.com"  # Email del usuario solicitante

    def get_password(self):
        return "Adrian29."  # Contraseña del usuario solicitante 