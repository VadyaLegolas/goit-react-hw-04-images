import { useState } from 'react';
import {
  Header,
  SearchForm,
  SearchFormButton,
  SearchFormButtonLabel,
  SearchFormInput,
} from './Searchbar.styled';
import { ImSearch } from 'react-icons/im';
import { toast } from 'react-toastify';

export const Searchbar = ({ onSubmit }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim() === '') {
      return toast.error('Введите запрос!');
    }
    onSubmit(query);
  };

  const handleChange = e => {
    setQuery(e.currentTarget.value);
  };

  return (
    <Header>
      <SearchForm onSubmit={handleSubmit}>
        <SearchFormButton type="submit">
          <ImSearch size={'20px'} />
          <SearchFormButtonLabel>Search</SearchFormButtonLabel>
        </SearchFormButton>

        <SearchFormInput
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="Search images and photos"
          value={query}
          onChange={handleChange}
        />
      </SearchForm>
    </Header>
  );
};
