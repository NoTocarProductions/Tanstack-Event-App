import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({    // you can send request anywhere in this component by using 'mutate'
    mutationFn: createNewEvent, // no need for anonymous function, doesnt send request on render with usemutation, only when u tell it to
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events']}); // invalidate the queries with the same key name so they will rerender.
      navigate('/events');
    }
  })

  function handleSubmit(formData) {
    mutate({event: formData})
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>
        )}
      </EventForm>
      {isError && <ErrorBlock title="failed to create event" message={error.info ? error.info.message : 'failed to create event'} />}
    </Modal>
  );
}
