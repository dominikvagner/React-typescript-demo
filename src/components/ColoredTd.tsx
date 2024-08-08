import { Td, TdProps } from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';
import { Color } from 'src/api/CustomerApi';

const useStyles = (color: Color) => // DONE: Use the new Color type to fix this.
  createUseStyles({
    withColor: {
      color,
    },
  });

export interface TdPropsWithColor extends Omit<TdProps, 'ref'> {
  color: Color; // Done: Use the new Color type to fix this.
}

export const ColoredTd = ({ color, ...rest }: TdPropsWithColor) => {
  const classes = useStyles(color)();
  return <Td className={classes.withColor} {...rest} />;
};
