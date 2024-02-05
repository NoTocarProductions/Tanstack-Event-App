import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  console.log("this is the id" + id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    // we can use aliases for same name props interfering with usequery
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate("../events");
      queryClient.invalidateQueries({ // reupdates all the queries witht that name instantly
        queryKey: ["events"],
        refetchType: "none",
      });
    },
  });

  function handleDelete() {
    mutate({ id: id });
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action can not be
            undone.
          </p>
          {isPending && <p>Deleting event...</p>}
          {!isPending && (
            <div className="form-actions">
              <button onClick={handleStopDelete} className="button-text">
                Cancel
              </button>
              <button onClick={handleDelete} className="button">
                Delete
              </button>
            </div>
          )}
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                deleteError.info
                  ? deleteError.info.message
                  : "failed, try again later"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isLoading && (
        <div id="event-details-content" className="center">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Failed to load selectable images"
            message={error.info ? error.message : "failed to fetch events."}
          />
        </div>
      )}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data.date} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
