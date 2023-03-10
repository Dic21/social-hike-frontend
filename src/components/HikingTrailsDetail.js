import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/zh-hk";
import { useDispatch, useSelector } from "react-redux";
import {showDetails,showEvents,setVisibles,showComments,showModal,updateText} from "../Slices/placeSlice";
import {Link, useParams,useNavigate} from 'react-router-dom';
import placeStyle from '../Place.module.css';
import closePic from "../Images/x-square-fill.svg";
import userIcon from "../Images/person.svg";


const HikingTrailsDetail = () => {
  const { details, eventList, visibles, cmList } = useSelector(
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
  }, [placeId]);

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
      
      <div className={placeStyle.bodycontainer}>
        <div className={placeStyle.placedesc}>{details.info.description}</div>
        <hr></hr>
        <div className={placeStyle.detailcontainer}>
          <div className={placeStyle.left}>
            <div className={placeStyle["event-headline"]}>
              <div className={placeStyle.mediumtitle}>??????</div>
              <span className={placeStyle["event-headline-right"]}>
                <span className={placeStyle.createbtn} onClick={() => {navigate("/event");}}>
                  ????????????
                </span>
              </span>
            </div>

            <div className={placeStyle["event-headline"]}>
              <div>?????????????????????: {details.info.num ? details.info.num : 0}</div>
              <div className={placeStyle["event-headline-right"]}>
                <select
                  name="sorting"
                  onChange={(e) => {
                    handleSortChange(e.target.value);
                  }}
                >
                  <option value="latestPublish">????????????</option>
                  <option value="recent">????????????</option>
                </select>
              </div>
            </div>
            <div className={placeStyle['event-container']}>          
              {eventList.length>=1? eventList.slice(0,visibles).map((event)=>{
                return (
                  <Event key={event.id} info={event}/>
                )
              }):<div>??????????????????????????????</div>}
              {eventList.length<=visibles? <p>-----</p>: <button className={placeStyle.morebtn} onClick={loadMore}>????????????</button>}
            </div>
          </div>

          <div className={placeStyle.right}>
            <div className={placeStyle["event-headline"]}>
              <div className={placeStyle.mediumtitle}>??????</div>
                <span className={placeStyle["event-headline-right"]}>
                  <span className={placeStyle.createbtn} onClick={addComment}>
                    ????????????
                  </span>
                </span>
            </div>
            <div className={placeStyle["event-headline"]}>
                {details.info.cmnum>=1? `????????????${details.info.cmnum}???????????????${cmList.length}???`: <span>&nbsp;</span>}
            </div>
            <div className={placeStyle['event-container']}>       
              {cmList.length>=1?    
                cmList.map((cm)=>{
                  return <Comment key={cm.id} info={cm}/>
                }): <div>??????????????????</div>
              }     
              {cmList.length===details.info.cmnum|| cmList.length===0? <p>-----</p>:<button className={placeStyle.morebtn} onClick={()=>{loadMoreCm(cmList.length)}}>????????????</button>}
              <Modal cmfetch={fetchCmData}/>
            </div>
          </div>
        </div>
      </div>
    </div>

    
  );
};

const Event = (props)=>{
  let startTime = moment(props.info.event_start_time).format('YYYY-MM-DD HH:mm:ss');
  let eventId = props.info.id;
  return (
    <Link to={`/event/${eventId}/detail`} className={placeStyle.eventlinkbox}>
      <div className={placeStyle.eventbox}>
        <h5>???????{props.info.event_name}</h5>
        <span>??????</span>
        <div>??????:{props.info.host}</div>
        <div>??????:{props.info.difficulty}</div>
        <div>????????????:{startTime}</div>
        <div>????????????:{props.info.description}</div>
      </div>
    </Link>
  )
}

const Comment = React.memo((props)=>{
  let date = moment(props.info.publish_date).format('YYYY-MM-DD HH:mm:ss');
  let dateFromNow= moment(date, "YYYYMMDD HHmmss").fromNow();
  let imageBox;
  if(props.info.is_photo === 1){
    imageBox = props.info.path;
  }

  return(
    <div className={placeStyle.commentbox}>
      <div><img src={userIcon} alt="icon"></img> {props.info.publisher}</div>
      <div>{dateFromNow}</div>
      <div>{props.info.message}</div>
      <div className={placeStyle.imagebox}>
        {imageBox? imageBox.map((img)=>{
          let path = img.slice(1);
          return <img key={path} src={path} alt="img"></img>
        }):null}
      </div>
    </div>
  );
});

const Modal=(props)=>{
  const { details, modalDisplay, comment } = useSelector((state)=>{return state.place});
  const { isLogin } = useSelector((state) => { return state.login});
  const dispatch = useDispatch();
  const [isFile, setIsFile] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const fileRef = useRef();
  const closeModal=()=>{
    dispatch(showModal(false));
  };

  const handleCmInput = (e)=>{
    dispatch(updateText(e.target.value));
  }

  const handleFileInput = ()=>{
    let files = fileRef.current.files;
    if(files.length>=1){
      setIsFile(true);
    }else{
      setIsFile(false);
    }
  }

  const handleSubmit= ()=>{
    let token = localStorage.getItem("token");
    let placeId = details.info.id;

    const formData = new FormData();
    formData.append('message', comment);
    if(isFile){
      let fileList = fileRef.current.files;
      for(let i = 0; i<fileList.length; i++){
        formData.append("pictures", fileList[i]);
      }
    }

    fetch(`/place/${placeId}/comment`, {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: formData
    }).then(resData=>resData.json()).then((data)=>{
      if(data.success){
        setMsgSent(true);
        setTimeout(()=>{
          dispatch(showModal(false));
          setMsgSent(false);
        }, 3000);
        dispatch(updateText(""));
        props.cmfetch();
      }else{
        alert(data.message);
      }
    })
  }

  const cmBox = 
    (<div className={placeStyle.modalcm}>
      <textarea id={placeStyle.userinputbox} onChange={handleCmInput} placeholder="????????????..."></textarea>
      <div>????????????<input type="file" ref={fileRef} name="pictures" accept="image/png, image/jpeg" onChange={handleFileInput} multiple></input></div>
      <button onClick={handleSubmit}>Send</button>
    </div>);

  const successBox = 
    (<div>
      ???????????????????????????3???????????????????????????
    </div>);

  if(modalDisplay){
    if(!isLogin){
      return (
        <div className={placeStyle.modal}>
          <div className={`${placeStyle["modalcontent"]} ${placeStyle["loginmodal"]}`}>
            <span onClick={closeModal}><img src={closePic} alt="close"></img></span>
              <div>????????????</div>
              <Link to="/login" onClick={closeModal}>??????</Link>
              <Link to="/register" onClick={closeModal}>??????</Link>
          </div>
        </div>
      )
    }else{
      return(
        <div className={placeStyle.modal}>
          <div className={placeStyle.modalcontent}>
            <span onClick={closeModal}><img src={closePic} alt="close"></img></span>
            {!msgSent? cmBox: successBox}
          </div>
        </div>
      );
    }
  } else {
    return null;
  }
}

export default HikingTrailsDetail;
