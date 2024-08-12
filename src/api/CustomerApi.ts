import { callAPI } from './apiUtilities';

export const choosableColors = ['red', 'pink', 'rebeccapurple', 'grey'] as const;

export type Color = typeof choosableColors[number]

export interface Customer {
  name: string;
  color: Color; // DONE: Create a new Color type, I only want the "choosableColors" above to be permitted on Customers
  age: number;
  isCool: boolean;
}

export type Customers = Array<Customer>;

// Local storage "DAO layer" Getter/Setters
export const customersSetter = (customers: Customers | undefined): Customers => {
  localStorage.setItem('customers', JSON.stringify(customers));
  return customers ?? [];
};

export const customersGetter = (): Customers => {
  const customers = localStorage.getItem('customers');
  if (customers) return [...JSON.parse(customers)];
  return [];
};

export const addNewCustomer = (customer: Customer): Customers => {
  const customers = customersGetter();
  customers.push(customer);
  return customersSetter(customers);
};

export const removeCustomer = (index: number): Customers => {
  const customers = customersGetter();
  const newCustomers = [...customers.slice(0, index), ...customers.slice(index + 1 > customers.length ? customers.length : index + 1)];
  return customersSetter(newCustomers)
}

// Super real API calls
export const getCustomers = () => callAPI(customersGetter, 0.7);

export const postCustomers = (customers: Array<Customer> | undefined) => () =>
  callAPI(() => customersSetter(customers));

export const postNewCustomer = (customer: Customer) => callAPI(() => addNewCustomer(customer));

export const deleteCustomer = (index: number) => callAPI(() => removeCustomer(index))
