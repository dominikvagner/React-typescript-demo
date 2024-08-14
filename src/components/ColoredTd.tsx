import { Td, TdProps } from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';
import { Color } from 'src/api/CustomerApi';
import { useAppContext } from 'src/middleware';

export const getColorValue = (color: Color, darkmode: boolean): string => {
  if (darkmode) {
    switch(color) {
      case 'red': return '#FF0000'
      case 'pink':return '#FF69B4'
      case 'rebeccapurple': return '#A18FFF'
      case 'grey': return '#D2D2D2'
      default: return '#6A6E73'
    }
  }
  switch(color) {
    case 'red': return '#EE0000'
    case 'pink': return '#DA1884'
    case 'rebeccapurple': return '#40199A'
    case 'grey': return '#6A6E73'
    default: return '#000000'
  }
}

export const useStyles = (color: Color) => // DONE: Use the new Color type to fix this.
  createUseStyles({
    withColor: {
      color: [[getColorValue(color, false)], '!important'],
    },
    withColorDark: {
      color: [[getColorValue(color, true)], '!important'],
    }
  });

export interface TdPropsWithColor extends Omit<TdProps, 'ref'> {
  color: Color; // Done: Use the new Color type to fix this.
}

export const ColoredTd = ({ color, ...rest }: TdPropsWithColor) => {
  const { darkmode } = useAppContext();

  const classes = useStyles(color)();
  return <Td className={darkmode ? classes.withColorDark : classes.withColor} {...rest} />;
};
