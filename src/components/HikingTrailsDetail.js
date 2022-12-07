import React, { useEffect } from "react";
import moment from "moment";
import "moment/locale/zh-hk";
import { useDispatch, useSelector } from "react-redux";
import {
  showDetails,
  showEvents,
  setVisibles,
  showComments,
  showModal,
} from "../Slices/placeSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import placeStyle from "../Place.module.css";

const HikingTrailsDetail = () => {
  const { details, eventList, visibles, cmList, modalDisplay } = useSelector(
    (state) => {
      return state.place;
    }
  );

  const { placeId } = useParams();
  const dispatch = useDispatch();
  let info, eventData;
  useEffect(() => {
    fetchData();
    fetchCmData();
  }, []);

  const fetchData = () => {
    fetch(`/place/${placeId}`)
      .then((resData) => resData.json())
      .then((data) => {
        info = data.info[0];
        eventData = data.event;
        let details = { info };
        dispatch(showDetails(details));
        dispatch(showEvents(eventData));
      });
  };

  //server-side pagination
  const fetchCmData = () => {
    fetch(`/place/${placeId}/comment?limit=0`)
      .then((resData) => resData.json())
      .then((data) => {
        let cmList = data.cm;
        dispatch(showComments(cmList));
      });
  };
  const loadMoreCm = (limit) => {
    fetch(`/place/${placeId}/comment?limit=${limit}`)
      .then((resData) => resData.json())
      .then((data) => {
        const newCmList = [...cmList, ...data.cm];
        dispatch(showComments(newCmList));
      });
  };

  const handleSortChange = (value) => {
    console.log(value);
    if (value === "latestPublish") {
      const sortList = [...eventList];
      sortList.sort((a, b) => {
        return b.id - a.id;
      });
      dispatch(showEvents(sortList));
      dispatch(setVisibles(2));
    } else if (value === "recent") {
      const sortList = [...eventList];
      sortList.sort((a, b) => {
        return new Date(a.event_start_time) - new Date(b.event_start_time);
      });
      dispatch(showEvents(sortList));
      dispatch(setVisibles(2));
    }
  };

  const loadMore = () => {
    dispatch(setVisibles(visibles + 2));
  };

  const addComment = () => {
    dispatch(showModal(true));
  };

  const navigate = useNavigate();

  if (!details) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <div className={placeStyle.banner}>
        <div id={placeStyle[details.info.id]}>
          {/* <div>{details && details.name}</div> */}
          <h3>{details.info.chi_name}</h3>
        </div>
      </div>
      <div>{details.info.description}</div>

      <div className={placeStyle.detailcontainer}>
        <div className={placeStyle.left}>
          <div className={placeStyle["event-headline"]}>
            <div className={placeStyle.mediumtitle}>活動</div>
            <span className={placeStyle["event-headline-right"]}>
              <span
                className={placeStyle.createbtn}
                onClick={() => {
                  navigate("/event");
                }}
              >
                建立活動
              </span>
            </span>
          </div>

          <div className={placeStyle["event-headline"]}>
            <div>準備出發的活動: {details.info.num ? details.info.num : 0}</div>
            <div className={placeStyle["event-headline-right"]}>
              <select
                name="sorting"
                onChange={(e) => {
                  handleSortChange(e.target.value);
                }}
              >
                <option value="latestPublish">最新建立</option>
                <option value="recent">最近</option>
              </select>
            </div>
          </div>
          <div className={placeStyle["event-container"]}>
            {eventList.length >= 1 ? (
              eventList.slice(0, visibles).map((event) => {
                return <Event key={event.id} info={event} />;
              })
            ) : (
              <div>暫時沒有可參與的活動</div>
            )}
            {eventList.length <= visibles ? (
              <p>-----</p>
            ) : (
              <button onClick={loadMore}>Load More</button>
            )}
          </div>
        </div>

        <div className={placeStyle.right}>
          <div className={placeStyle["event-headline"]}>
            <div className={placeStyle.mediumtitle}>評論</div>
            <span className={placeStyle["event-headline-right"]}>
              <span className={placeStyle.createbtn} onClick={addComment}>
                建立評論
              </span>
            </span>
          </div>
          <div className={placeStyle["event-headline"]}>
            {details.info.cmnum >= 1 ? (
              `顯示全部${details.info.cmnum}個回應中的${cmList.length}個`
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
          <div className={placeStyle["event-container"]}>
            {cmList.length >= 1 ? (
              cmList.map((cm) => {
                return <Comment key={cm.id} info={cm} />;
              })
            ) : (
              <div>暫時沒有評論</div>
            )}
            {cmList.length === details.info.cmnum || cmList.length === 0 ? (
              <p>-----</p>
            ) : (
              <button
                onClick={() => {
                  loadMoreCm(cmList.length);
                }}
              >
                Load More
              </button>
            )}

            <Modal />
          </div>
        </div>
      </div>
    </div>
  );
};

const Event = (props) => {
  return (
    <div className={placeStyle.eventbox}>
      <h5>🏞️{props.info.event_name}</h5>
      <span>詳情</span>
      <div>領隊:{props.info.host}</div>
      <div>難度:{props.info.difficulty}</div>
      <div>日期:{props.info.event_start_time}</div>
      <div>行程描述:{props.info.description}</div>
    </div>
  );
};

const Comment = React.memo((props) => {
  useEffect(() => {
    console.log("i am rendering");
  });
  let date = moment(props.info.publish_date)
    .utc(true)
    .format("YYYY-MM-DD HH:mm:ss");
  let dateFromNow = moment(date, "YYYYMMDD HHmmss").fromNow();
  return (
    <div className={placeStyle.commentbox}>
      <div>{props.info.publisher}</div>
      <div>{dateFromNow}</div>
      <div>{props.info.message}</div>
    </div>
  );
});

const Modal = () => {
  const { modalDisplay } = useSelector((state) => {
    return state.place;
  });
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(showModal(false));
  };
  //if loggedIn state false, can show a btn to loginpage

  const handleCmInput = () => {};

  if (modalDisplay) {
    return (
      <div className={placeStyle.modal}>
        <div className={placeStyle.modalcontent}>
          <span onClick={closeModal}>X</span>
          <div>
            <textarea placeholder="Type your comment"></textarea>
            This is content
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default HikingTrailsDetail;
