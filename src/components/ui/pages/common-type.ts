import { Dispatch, SetStateAction, SyntheticEvent } from 'react';

export type PageUIProps = {
  loading?: boolean;
  errorText: string | undefined;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: SyntheticEvent) => void;
};
