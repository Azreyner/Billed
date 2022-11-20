/**
 * @jest-environment jsdom
 */

// Imports mis à jour
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event' 
import NewBillUI from "../views/NewBillUI.js" 
import BillsUI from "../views/BillsUI.js" 
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store" 
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowMail = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowMail.classList.contains('active-icon')).toBe(true) // vérifie si l'icone est en surbrillance - LIGNE AJOUTÉE
    })
    // TEST AJOUTÉ, à partir du test précédent
    test('Then click on fileUploader', () => {
      const newBill = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(newBill.handleChangeFile)
      const buttonNewBill = screen.getByTestId('file');
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
    test('Then click on submit button', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleClickSubmit = jest.fn(newBill.handleSubmits)
      const buttonSubmit = screen.getByTestId('form-submit-btn');
      buttonSubmit.addEventListener('click', handleClickSubmit)
      userEvent.click(buttonSubmit)
      expect(handleClickSubmit).toHaveBeenCalled()
    })
  })
})

// test d'intégration Post
describe("Given I am connected as an employee and on NewBill Page", () => {
  describe("When I submit the form", () => {
    test('It should create a new bill', async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))// Set user as Employee in localStorage
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      const date = "2002-02-02"
      const amount = "100"
      const pct = "10"
      const inputDate = screen.getByTestId("datepicker")
      const inputAmount = screen.getByTestId("amount")
      const inputPct = screen.getByTestId("pct")
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputDate, { target: { value: date } })
      fireEvent.change(inputAmount, { target: { value: amount } })
      fireEvent.change(inputPct, { target: { value: pct } })
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["myFile.png"], "myFile.png", { type: "image/png" })]
        }
      })
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills") //fonction simulée qui surveille l'appel de la méthode bills de l'objet store
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("It should create a new bill but fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => { // simule un rejet de la promesse
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    // test("It should create a new bill but fails with 500 message error", async () => {

    //   mockStore.bills.mockImplementationOnce(() => {
    //     return {
    //       create: () => {
    //         return Promise.reject(new Error("Erreur 500"))
    //       }
    //     }
    //   })
    //   document.body.innerHTML = BillsUI({ error: "Erreur 500" })
    //   const message = await screen.getByText(/Erreur 500/)
    //   expect(message).toBeTruthy()
    // })
  })

})