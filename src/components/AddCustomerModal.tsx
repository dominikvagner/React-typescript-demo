import { FormEvent, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useMutation, useQueryClient } from 'react-query';
import { choosableColors, Color, Customer, postNewCustomer } from 'src/api/CustomerApi';

import {
  Checkbox, Form, Grid, Modal, ModalVariant, Select, SelectDirection, SelectOption, SelectVariant,
  Text, TextInput
} from '@patternfly/react-core';

import { SnazzyButton } from './SnazzyButton';
import { useAppContext } from 'src/middleware';


const useStyles = createUseStyles({
  inlineText: {
    display: 'block',
  },
  darkModeModal: {
    color: [['#e2e8f0'], '!important'],
    '--pf-c-modal-box--BackgroundColor': [['#404040'], '!important'],
    '--pf-c-check__label--Color': [['#e2e8f0'], '!important'],
    '& .pf-c-button.pf-m-plain:hover': {
      '--pf-c-button--m-plain--Color': [['#e5e5e5'], '!important'],
    },
    '& .pf-c-button.pf-m-plain:focus': {
      '--pf-c-button--m-plain--Color': [['#e5e5e5'], '!important'],
    },
    '& .pf-c-check__label': {
      color: [['#e2e8f0'], '!important'],
    },
    '& .pf-c-select__toggle': {
      color: [['#e2e8f0'], '!important'],
      backgroundColor: [['#404040'], '!important'],
      borderWidth: 0,
      borderBottom: '2px solid #737373 !important',
      '&:hover': {
        border: 'none'
      },
      '&:before': {
        border: 'none',
      }
    },
    '& .pf-c-select__menu': {
      backgroundColor: [['#404040'], '!important'],
    },
    '& .pf-c-select__menu-wrapper:hover, .pf-c-select__menu-item:hover': {
        backgroundColor: [['#525252'], '!important'],
    },
    '& .pf-c-form-control': {
      color: [['#e2e8f0'], '!important'],
      backgroundColor: [['#404040'], '!important'],
      borderWidth: 0,
      borderBottom: '2px solid #525252 !important',
      '&:focus': {
        outline: 'none',
        border: '1px solid #d4d4d4 !important',
      }
    },
  },
});

type AddCustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal = ({ isOpen, onClose }: AddCustomerModalProps) => {
  const classes = useStyles();
  const { darkmode } = useAppContext();
  const [newUser, setNewUser] = useState<Partial<Customer>>({ isCool: false });
  const [selectToggle, setSelectToggle] = useState(false);
  const queryClient = useQueryClient();

  const newUserMutation = useMutation(postNewCustomer, {
    onMutate: async newCustomer => {
      await queryClient.cancelQueries('customers');
      const previousCustomers = queryClient.getQueryData('customers');
      queryClient.setQueryData('customers', old => [...old as Customer[], newCustomer]);
      return { previousCustomers };
    },
    onError: (err, newCustomer, context) => {
      queryClient.setQueryData('todos', context?.previousCustomers)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  })

  const onSubmit = (e: FormEvent<Element>) => {
    e.preventDefault();
    newUserMutation.mutate({
      name: 'John Doe',
      color: 'red',
      age: 0,
      isCool: false,
      ...newUser
    });
    setNewUser({ isCool: false });
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title='Add Customer'
      isOpen={isOpen}
      onClose={onClose}
      className={darkmode ? classes.darkModeModal : ''}
    >
      <Form onSubmit={onSubmit}>
        <Grid className={classes.inlineText}>
          <Text>Name</Text>
          <TextInput
            onChange={(value) => setNewUser({ ...newUser, name: value })}
            value={newUser.name || ''}
            id='name'
            type='text'
          />
        </Grid>
        <Grid className={classes.inlineText}>
          <Text>Age</Text>
          <TextInput
            onChange={(value) => setNewUser({ ...newUser, age: Number(value) })}
            value={newUser.age || ''}
            id='age'
            type='number'
          />
        </Grid>
        <Grid className={classes.inlineText}>
          <Text>Color</Text>
          <Select
            onToggle={() => setSelectToggle(!selectToggle)}
            isOpen={selectToggle}
            onSelect={(_e, value) => {
              if (typeof value === 'string')
                // DONE: Fix this when creating the new Color type
                setNewUser({ ...newUser, color: value as Color });
              setSelectToggle(false);
            }}
            id='color'
            variant={SelectVariant.single}
            placeholderText='Select a color'
            selections={newUser?.color}
            direction={SelectDirection.up}
          >
            {choosableColors.map((color: string, index) => (
              <SelectOption style={{ color }} key={index} value={color} />
            ))}
          </Select>
        </Grid>
        <Checkbox
          label='Is this person cool?'
          id='isCool'
          onChange={(value) => setNewUser({ ...newUser, isCool: value })}
          isChecked={newUser.isCool}
        />
        <SnazzyButton isSnazzy={true} type='submit'>Submit</SnazzyButton>
      </Form>
    </Modal>
  )
}
