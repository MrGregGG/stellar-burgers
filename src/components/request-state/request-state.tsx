import { Button } from '@zlden/react-developer-burger-ui-components';
export const RequestError = ({
  message,
  retry
}: {
  message: string;
  retry?: () => void;
}) => (
  <div role='alert' className='request-state text text_type_main-default'>
    <p>{message}</p>
    {retry && (
      <Button htmlType='button' type='secondary' onClick={retry}>
        Повторить
      </Button>
    )}
  </div>
);
export const EmptyState = ({ text }: { text: string }) => (
  <p
    role='status'
    className='request-state text text_type_main-default text_color_inactive'
  >
    {text}
  </p>
);
