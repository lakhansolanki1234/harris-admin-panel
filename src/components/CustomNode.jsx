import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css';

function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function CustomNode(props) {
  const [showToolbar, setShowToolbar] = useState(false);
  const wrapperRef = useRef(null);

  const { id, xPos, yPos, data } = props;
  const { setNodes,sublabel, label, getId, selectNode, nodedata } = data;
  const [dateTimeOption, setDateTimeOption] = useState(nodedata.dateTimeOption || 'dateTime');
  const [datetime, setdate] = useState(formatDateTime(new Date()));

  useEffect(() => {
    setDateTimeOption(nodedata.dateTimeOption || 'dateTime');
  }, [nodedata]);

  const deleteNodeById = () => {
    setNodes(nds => nds.filter(node => node.id !== id));
  };

  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowToolbar(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideAlerter(wrapperRef);

  const addNewNode = () => {
    const position = {
      x: xPos + 10,
      y: yPos + 10,
    };

    let nodedata = {};
    switch (label) {
      case 'Message':
        nodedata['content'] = '';
        break;
      case 'Input':
        nodedata['content'] = '';
        break;
      case 'Date Time':
        nodedata['content'] = '';
        nodedata['dateTimeOption'] = 'dateTime';
        break;
      case 'Questions':
        nodedata['qa_q'] = '';
        nodedata['qa_a'] = '';
        break;
      case 'Options':
        nodedata['data'] = [];
        break;
      case 'Quick Answers':
        nodedata['qu_content'] = '';
        nodedata['qu_data'] = [];
        break;
      case 'Answer with Text':
        nodedata['answer_content'] = '';
        nodedata['answer_buttons'] = [];
        break;
      case 'Upload Media':
        nodedata['media_type'] = '';
        nodedata['media_name'] = '';
        nodedata['media_content'] = null;
        break;
      case 'Talk with advisor':
        nodedata['advisorName'] = '';
        nodedata['advisorEmail'] = '';
        break;
      case 'Link':
        nodedata['linkText'] = '';
        nodedata['hrefValue'] = '';
        nodedata['linkTarget'] = '';
        break;
      case 'Web Service':
        nodedata['api_url'] = 'https://example...';
        nodedata['api_method'] = 'GET';
        nodedata['api_headers'] = [];
        nodedata['api_params'] = [];
        nodedata['api_res_variable'] = null;
        nodedata['api_res_data'] = null;
        break;
      default:
        break;
    }
    const edgeStyle = {
      stroke: '#ccc',
      strokeWidth: 2,
      strokeDasharray: '5 5',
    };
    const newNode = {
      id: getId(),
      type: 'customNode',
      position,
      data: { label: `${label}`,sublabel:`${sublabel}`, setNodes, getId, selectNode, nodedata },
      style: edgeStyle,
      animated: true,
    };
    setNodes((nds) => nds.concat(newNode));
    setShowToolbar(false);
  };

  const onSelectedNode = () => {
    setShowToolbar(true);
    selectNode(props);
  };

  return (
    <>
      {
        showToolbar &&
        <div className='flex absolute -top-6 border border-gray-400 rounded-full p-1 px-2' style={{ fontSize: 10 }} ref={wrapperRef}>
          <i className='fa fa-trash cursor-pointer icon' onClick={deleteNodeById}></i>
          <i className='fa fa-plus cursor-pointer icon' onClick={addNewNode}></i>
        </div>
      }
      <div className='node-wrapper cursor-pointer' onClick={onSelectedNode}>
        <p className="node-header">
          {label === 'Date Time' && <img src="imgs/schedule-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {label === 'Options' && <img src="imgs/options-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {label === 'Message' && <img src="imgs/message-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {label === 'Upload Media' && <img src="imgs/media-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {label === 'Input' && <img src="imgs/message-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {sublabel}
        </p>
        <div className='node-content'>
          {
            label === 'Message' && 
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='message' className='handle top' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p className='empty-message'><i>no messages</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="message" className='handle bottom' />
            </div>
          }
          {
            label === 'Input' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='input' className='handle top' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p className='empty-message'><i>User Input</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="input" className='handle bottom' />
            </div>
          }
          {
            label === 'Date Time' && 
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='date' className='handle top' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p ><i>{datetime}</i><br /></p>
              }
              <div className="mt-2">
                <p className='text-sm text-gray-700'>
                  Selected Option: <strong>{dateTimeOption === 'date' ? 'Date' : dateTimeOption === 'time' ? 'Time' : 'Date and Time'}</strong>
                </p>
              </div>
              <Handle type="source" position={Position.Bottom} id="date" className='handle bottom' />
            </div>
          }
          {
            label === 'Questions' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='question' className='handle top' />
              {
                nodedata.qa_q
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.qa_q }}></div>
                  : <p className='empty-message'><i>no questions</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="question" className='handle bottom' />
            </div>
          }
          {
            label === 'Options' && (
              <div className='p-2'>
                <Handle type="target" position={Position.Top} id='options' className='handle top' />
                <div>
                  {nodedata.content && nodedata.content.length > 0 ? (
                    nodedata.content.map((option, index) => (
                      <div
                        className='w-full flex justify-between cursor-pointer hover:bg-[#eee] p-1 px-2 relative'
                        key={index}
                      >
                        <p>{option.value}</p> {/* Display only the option value */}
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`option${index}`}
                          className='handle right'
                          style={{ top: '50%', transform: 'translateY(-50%)' }}
                        />
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
                
                
              </div>
            )
          }
          {
            label === 'Quick Answers' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='quick-answer' className='handle top' />
              <div>
                {
                  nodedata.qu_data.length > 0
                    ? nodedata.qu_data.map((data, no) => (
                        <div key={no} className='m-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 rounded my-1 focus:ring-4 focus:ring-gray-200 text-xs px-4 py-1'>
                          <span>{data.name}</span>
                          <Handle
                            type="source"
                            position={Position.Right}
                            id={`quick-answer-${no}`}
                            className='handle right'
                            style={{ top: (no + 1) * 31 + 46 }}
                          />
                          <Handle
                            type="target"
                            position={Position.Left}
                            id={`quick-answer-${no}`}
                            className='handle left'
                            style={{ top: (no + 1) * 31 + 46 }}
                          />
                        </div>
                      ))
                    : <></>
                }
              </div>
              <div className=''>
                {
                  nodedata.qu_content
                    ? <div dangerouslySetInnerHTML={{ __html: nodedata.qu_content }} className="border-gray-400 border-t p-2"></div>
                    : <p className='empty-message border-gray-400 border-t p-2'><i>no content</i></p>
                }
              </div>
              <Handle type="source" position={Position.Bottom} id="quick-answer" className='handle bottom' />
            </div>
          }
          {
            label === 'Answer with Text' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='answer-with-text' className='handle top' />
              <div>
                {
                  nodedata.answer_buttons.length > 0
                    ? nodedata.answer_buttons.map((data, no) => (
                        <div key={no} className='m-2 text-gray-900 bg-white border border-[#9d174d] focus:outline-none hover:bg-[#9d174d] rounded my-1 hover:text-white text-[#9d174d] text-xs px-4 py-[5px]'>
                          <span>{data.name}</span>
                          <Handle
                            type="source"
                            position={Position.Right}
                            id={`answer-text-${no}`}
                            className='handle right'
                            style={{ top: (no + 1) * 32 + 24 }}
                          />
                          <Handle
                            type="target"
                            position={Position.Left}
                            id={`answer-text-${no}`}
                            className='handle left'
                            style={{ top: (no + 1) * 32 + 24 }}
                          />
                        </div>
                      ))
                    : <></>
                }
              </div>
              {
                nodedata.answer_content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.answer_content }} className='border-t border-gray-300 p-2'></div>
                  : <p className='empty-message border-t p-2 border-gray-300'><i>no answer</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="answer-with-text" className='handle bottom' />
            </div>
          }
          {
            label === 'Upload Media' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='media' className='handle top' />
              {
                nodedata.media_content
                  ? <div className='relative border rounded p-2'>
                      {
                        nodedata.media_type === 'video'
                          ? <video className='w-full h-auto rounded' controls>
                              <source src={URL.createObjectURL(nodedata.media_content)} type="video/mp4" />
                            </video>
                          : nodedata.media_type === 'image'
                            ? <img src={URL.createObjectURL(nodedata.media_content)} className='w-full h-auto rounded' alt='Media' />
                            : <div className='p-2 py-4 text-xs'>{nodedata.media_name}</div>
                      }
                    </div>
                  : <div className='w-full h-full border-0 bg-[#F0F2F4] py-6 rounded-b' >
                      <div className="flex flex-col items-center justify-center w-fit h-auto z-[5] relative mx-auto rounded-lg cursor-pointer bg-white hover:bg-[#fafafa]">
                        <img src={'/imgs/empty-img.png'} className='border-0 rounded-lg w-8' alt='Empty' />
                      </div>
                      <p className='text-center text-[#555]'><i>Empty</i></p>
                    </div>
              }
              <Handle type="source" position={Position.Bottom} id="media" className='handle bottom' />
            </div>
          }
          {label === 'Talk with advisor' && (
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='talk-to-advisor' className='handle top' />
              {nodedata?.content?.advisorName && nodedata?.content?.advisorEmail ? (
                <div>
                  <p className='text-[#555]'>
                    Talk with <strong>{nodedata.content.advisorName}</strong> ({nodedata.content.advisorEmail})
                  </p>
                </div>
              ) : (
                <p className='empty-message'><i>No advisor information</i><br /></p>
              )}
              <Handle type="source" position={Position.Bottom} id="talk-to-advisor" className='handle bottom' />
            </div>
          )}
          {label === 'Link' && (
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='anchor-node' className='handle top' />
              {nodedata?.content?.hrefValue ? (
                <div>
                  <p className='text-[#555]'>
                    {nodedata.content.linkText}
                  </p>
                  <p className='text-[#555]'>
                    <strong>
                      {nodedata.content.hrefValue}
                    </strong>
                  </p>
                </div>
              ) : (
                <p className='empty-message'><i>No Link information</i></p>
              )}
              <Handle type="source" position={Position.Bottom} id="anchor-node" className='handle bottom' />
            </div>
          )}
          {
            label === 'Web Service' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='web-service' className='handle top' />
              <p className='text-[#555]'>Service API</p>
              <p className='mt-1 text-sm'>{nodedata.api_url}</p>
              <Handle type="source" position={Position.Bottom} id="web-service" className='handle bottom' />
            </div>
          }
        </div>
      </div>
    </>
  );
}

export default memo(CustomNode);
