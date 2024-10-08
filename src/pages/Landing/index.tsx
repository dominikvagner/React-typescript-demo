import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Customer, deleteCustomer, getCustomers } from 'src/api/CustomerApi';
import { AddCustomerModal } from 'src/components/AddCustomerModal';
import { ColoredTd } from 'src/components/ColoredTd';
import Loader from 'src/components/Loader';
import { useAppContext } from 'src/middleware';

import { Button, Grid, GridItem } from '@patternfly/react-core';
import {
    ActionsColumn, Caption, IAction, TableComposable, Tbody, Td, Th, Thead, Tr
} from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  darkModeTable: {
    '--pf-c-table--BackgroundColor': [['#000'], '!important'],
    '--pf-c-table--BorderColor': [['#7e7c7c'], '!important'],
    '--pf-c-table--cell--Color': [['#e2e8f0'], '!important'],
    '& .pf-c-dropdown__toggle.pf-m-plain:hover, .pf-c-dropdown__toggle.pf-m-plain:focus, .pf-c-dropdown__toggle.pf-m-plain:active, .pf-c-dropdown__toggle.pf-m-plain.pf-m-active, .pf-m-expanded > .pf-c-dropdown__toggle.pf-m-plain': {
      '--pf-c-dropdown__toggle--m-plain--Color': [['#e5e5e5'], '!important'],
      '--pf-c-dropdown--m-plain__toggle-icon--Color': [['#e5e5e5'], '!important'],
    },
    '& .pf-c-dropdown__menu': {
      backgroundColor: [['#151515'], '!important'],
    },
    '& .pf-c-dropdown__menu-item': {
      color: [['#e2e8f0'], '!important'],
    },
    '& .pf-c-dropdown__menu-wrapper:hover, .pf-c-dropdown__menu-item:hover': {
        backgroundColor: [['#525252'], '!important'],
    },
    '& caption': {
      color: [['#D2D2D2'], '!important']
    }
  },
  darkModeButton: {
    color: [['#2B9AF3'], '!important'],
    borderColor: [['#2B9AF3'], '!important'],
  }
});


export default () => {
  const classes = useStyles();
  const { setDarkmode, darkmode } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { isLoading, isError, data, error } = useQuery('customers', getCustomers, {
    retry: 5
  });

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
      queryClient.setQueryData('customers', context?.previousCustomers)
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

  if (isError) {
    return <span color='black'>Error: {error} Please <a href=".">reload</a> this site!</span>
  }

  return (
    <Grid>
      <GridItem sm={6}>
        <Button onClick={() => setDarkmode(!darkmode)} variant='secondary' className={darkmode ? classes.darkModeButton : ''}>
          {darkmode ? 'LightMode' : 'DarkMode'}
        </Button>
      </GridItem>
      <GridItem sm={6}>
        <Button onClick={() => setIsModalOpen(true)} variant='secondary' className={darkmode ? classes.darkModeButton : ''}>
          Add New Customer
        </Button>
      </GridItem>
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Grid>
        <TableComposable aria-label='Simple table' variant='compact' className={darkmode ? classes.darkModeTable : ''}>
          <Caption >Here is a list of your customers:</Caption>
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
