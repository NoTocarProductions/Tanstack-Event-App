import { Link, redirect, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });

  const { mutate } = useMutation({

    mutationFn: updateEvent,

    onMutate: async (data) => { // you get 'data' because REACT query passes this data when calling mutate.
      // you update the data that is cached.
      // queryclient allows you to interact with tanstack query.
      const newEvent = data.event; // the new event 
      await queryClient.cancelQueries({queryKey: ['events', params.id]}) // so we have no clashes and won't fetch old data. Returns a promise.
      const previousEvent = queryClient.getQueryData(['events', params.id]);
      queryClient.setQueryData(['events', params.id], newEvent) // manipulate(!) the specific stored data yourself without waiting for a response.

      return {previousEvent};
    },

    onError: (error, data, context) => {
      queryClient.setQueryData(['events', params.id], context.previousEvent) // rolling back optimistic updating if the mutation fails.
    },

    onSettled: () => { // will be called whenever this mutation is done, failed or succeeded doesn't matter. 
      queryClient.invalidateQueries(['events', params.id]); // additional check, will force a refetch of data behind the scenes if they are out of sync.
    }
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate("../");
  }

  let content;


  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info
              ? error.info.message
              : "failed to load events please check your inputs and try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
