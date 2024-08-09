import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Customer, deleteCustomer, getCustomers } from 'src/api/CustomerApi';
import { AddCustomerModal } from 'src/components/AddCustomerModal';
import { ColoredTd } from 'src/components/ColoredTd';
import Loader from 'src/components/Loader';
import { useAppContext } from 'src/middleware';

import { Button, Grid, GridItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import {
    ActionsColumn, Caption, IAction, TableComposable, Tbody, Td, Th, Thead, Tr
} from '@patternfly/react-table';

export default () => {
  const { setDarkmode, darkmode } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { isLoading, data } = useQuery(
    'customers',
    getCustomers,
    // TODO: Stretch - Use the options object to handle errors.
  );

  const deleteCustomerMutation = useMutation(deleteCustomer, {
    onMutate: async index => {
      await queryClient.cancelQueries('customers');
      const previousCustomers = queryClient.getQueryData('customers');
      queryClient.setQueryData('customers', old => {
        const customers = [...old as Customer[]];
        const newCustomers = [...customers.slice(0, index), ...customers.slice(index + 1 > customers.length ? customers.length : index + 1)];
        return newCustomers;
      });
      return { previousCustomers };
    },
    onError: (err, newCustomer, context) => {
      queryClient.setQueryData('todos', context?.previousCustomers)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  })

  const defaultActions = (index: number): IAction[] => [
    {
      title: 'Delete',
      onClick: () => deleteCustomerMutation.mutate(index),
    },
  ];

  const columnHeaders = ['Name', 'Age', 'Is Cool'];

  if (isLoading) return <Loader />;
  return (
    <Grid>
      <GridItem sm={6}>
        <Button onClick={() => setDarkmode(!darkmode)} variant='secondary'>
          {darkmode ? 'LightMode' : 'DarkMode'}
        </Button>
      </GridItem>
      <GridItem sm={6}>
        <Button onClick={() => setIsModalOpen(true)} variant='secondary'>
          Add New Customer
        </Button>
      </GridItem>
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Grid>
        <TableComposable aria-label='Simple table' variant='compact'>
          <Caption>Here is a list of your customers:</Caption>
          <Thead>
            <Tr>
              {columnHeaders.map((columnHeader) => (
                <Th key={columnHeader}>{columnHeader}</Th>
              ))}
              <Td></Td>
            </Tr>
          </Thead>
          <Tbody>
            {data?.map(({ name, age, color, isCool }, key: number) => {
              const rowActions: IAction[] = defaultActions(key)
              return (
                <Tr key={name + key}>
                  <ColoredTd color={color} dataLabel='name'>
                    {name}
                  </ColoredTd>
                  <ColoredTd color={color} dataLabel='age'>
                    {age}
                  </ColoredTd>
                  <ColoredTd color={color} dataLabel='isCool'>
                    {isCool ? 'Yup' : 'Totally Not!'}
                  </ColoredTd>
                  <Td isActionCell>
                    <ActionsColumn items={rowActions} />
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </TableComposable>
      </Grid>
    </Grid>
  );
};
