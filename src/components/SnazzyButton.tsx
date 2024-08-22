import { Button, ButtonProps } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { snazzyButtonStyle } from './helpers';

export interface SnazzyButtonProps extends Omit<ButtonProps, 'ref'> {
  isSnazzy: boolean;
}

const useStyles = createUseStyles({
    snazzy: snazzyButtonStyle
  });

export const SnazzyButton = ({ isSnazzy, children, ...props }: SnazzyButtonProps) => {
  const classes = useStyles();
  return (
    <Button className={isSnazzy ? classes.snazzy : ''} {...props}>
      {children}
    </Button>
  )
}
