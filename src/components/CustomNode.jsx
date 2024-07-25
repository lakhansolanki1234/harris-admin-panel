import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

function CustomNode(props) {
  const [showToolbar, setShowToolbar] = useState(false);
  const wrapperRef = useRef(null);

  const { id, xPos, yPos, data } = props;
  const { setNodes, label, getId, selectNode, nodedata } = data;
  const [dateTimeOption, setDateTimeOption] = useState(nodedata.dateTimeOption || 'dateTime');

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
      data: { label: `${label}`, setNodes, getId, selectNode, nodedata },
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
          <i className='fa fa-trash cursor-pointer' onClick={deleteNodeById}></i>
          <i className='fa fa-plus cursor-pointer ml-2' onClick={addNewNode}></i>
        </div>
      }
      <div className='border border-gray-500 rounded bg-white cursor-pointer w-44 p-2' onClick={onSelectedNode}>
        <p className="text-xs font-bold border-b border-gray-500 p-2 flex">
          {label === 'Date Time' && <img src="imgs/schedule-icon.png" className='h-5 mr-2' alt="A" width={20} />}
          {label}
        </p>
        <div className='text-xs max-w-44 break-words h-fit'>
          {
            label === 'Message' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='message' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p className='text-[#aaa]'><i>no messages</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="message" />
            </div>
          }
           {
            label === 'Input' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='message' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p className='text-[#aaa]'><i>User Input</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="message" />
            </div>
          }
          {
            label === 'Date Time' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='date' />
              {
                nodedata.content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.content }}></div>
                  : <p className='text-[#aaa]'><i>no messages</i><br /></p>
              }
              <div className="mt-2">
                <p className='text-sm text-gray-700'>
                  Selected Option: <strong>{dateTimeOption === 'date' ? 'Date' : dateTimeOption === 'time' ? 'Time' : 'Date and Time'}</strong>
                </p>
              </div>
              <Handle type="source" position={Position.Bottom} id="date" />
            </div>
          }
          {
            label === 'Questions' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='question' />
              {
                nodedata.qa_q
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.qa_q }}></div>
                  : <p className='text-[#aaa]'><i>no questions</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="question" />
            </div>
          }

          {
            label === 'Options' && (
              <div className=''>
                <Handle type="target" position={Position.Top} id='options' />
                <div className=''>
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
                          style={{ top: '50%', transform: 'translateY(-50%)', background: '#555' }}
                        />
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
                <div className=''>
                  {nodedata.option_content ? (
                    <div dangerouslySetInnerHTML={{ __html: nodedata.option_content }} className="border-t p-2 border-gray-300"></div>
                  ) : (
                    <p className='text-[#aaa] p-2 border-t border-gray-300'><i>no content</i><br /></p>
                  )}
                </div>
              </div>
            )
          }

          {
            label === 'Quick Answers' &&
            <div className=''>
              <Handle type="target" position={Position.Top} id='quick-answer' />
              <div className=''>
                {
                  nodedata.qu_data.length > 0
                    ?
                    nodedata.qu_data.map((data, no) => (
                      <div key={no} className='m-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 rounded my-1 focus:ring-4 focus:ring-gray-200 text-xs px-4 py-1 border-b border-gray-500'>
                        <span>{data.name}</span>
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`quick-answer-${no}`}
                          style={{ top: (no + 1) * 31 + 46, background: '#555' }}
                        />
                        <Handle
                          type="target"
                          position={Position.Left}
                          id={`quick-answer-${no}`}
                          style={{ top: (no + 1) * 31 + 46, background: '#555' }}
                        />
                      </div>
                    ))
                    :
                    <></>
                }
              </div>
              <div className=''>
                {
                  nodedata.qu_content
                    ? <div dangerouslySetInnerHTML={{ __html: nodedata.qu_content }} className="border-gray-400 border-t p-2"></div>
                    : <p className='text-[#aaa] border-gray-400 border-t p-2'><i>no content</i></p>
                }
              </div>
              <Handle type="source" position={Position.Bottom} id="quick-answer" />
            </div>
          }


          {
            label === 'Answer with Text' &&
            <div className=''>
              <Handle type="target" position={Position.Top} id='answer-with-text' />
              <div className=''>
                {
                  nodedata.answer_buttons.length > 0
                    ?
                    nodedata.answer_buttons.map((data, no) => (
                      <div key={no} className='m-2 text-gray-900 bg-white border border-[#9d174d] focus:outline-none hover:bg-[#9d174d] rounded my-1 hover:text-white text-[#9d174d] text-xs px-4 py-[5px]'>
                        <span>{data.name}</span>
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`answer-text-${no}`}
                          style={{ top: (no + 1) * 32 + 24, background: '#555' }}
                        />
                        <Handle
                          type="target"
                          position={Position.Left}
                          id={`answer-text-${no}`}
                          style={{ top: (no + 1) * 32 + 24, background: '#555' }}
                        />
                      </div>
                    ))
                    :
                    <></>
                }
              </div>
              {
                nodedata.answer_content
                  ? <div dangerouslySetInnerHTML={{ __html: nodedata.answer_content }} className='border-t border-gray-300 p-2'></div>
                  : <p className='text-[#aaa] border-t p-2 border-gray-300'><i>no answer</i><br /></p>
              }
              <Handle type="source" position={Position.Bottom} id="answer-with-text" />
            </div>
          }

          {
            label === 'Upload Media' &&
            <div className=''>
              <Handle type="target" position={Position.Top} id='media' />
              {
                nodedata.media_content
                  ?
                  <div className='relative border rounded p-2'>
                    {
                      nodedata.media_type === 'video' ?
                        <video className='w-full h-auto rounded' controls>
                          <source src={URL.createObjectURL(nodedata.media_content)} type="video/mp4" />
                        </video>
                        :
                        nodedata.media_type === 'image'
                          ? <img src={URL.createObjectURL(nodedata.media_content)} className='w-full h-auto rounded' alt='B' />
                          : <div className='p-2 py-4 text-xs'>{nodedata.media_name}</div>
                    }
                  </div>
                  :
                  <div className='w-full h-full border-0 bg-[#F0F2F4] py-6 rounded-b' >
                    <div className="flex flex-col items-center justify-center w-fit h-auto z-[5] relative mx-auto rounded-lg cursor-pointer bg-white hover:bg-[#fafafa]">
                      <img src={'/imgs/empty-img.png'} className='border-0 rounded-lg w-8' alt='' />
                    </div>
                    <p className='text-center text-[#555]'><i>Empty</i></p>
                  </div>
              }
              <Handle type="source" position={Position.Bottom} id="media" />
            </div>
          }

          {label === 'Talk with advisor' && (
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='talk-to-advisor' />
              {nodedata?.content?.advisorName && nodedata?.content?.advisorEmail ? (
                <div>
                  <p className='text-[#555]'>
                    Talk with <strong>{nodedata.content.advisorName}</strong> ({nodedata.content.advisorEmail})
                  </p>
                </div>
              ) : (
                <p className='text-[#aaa]'><i>No advisor information</i><br /></p>
              )}
              <Handle type="source" position={Position.Bottom} id="talk-to-advisor" />
            </div>
          )}
          {label === 'Link' && (
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='anchor-node' />
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
                <p className='text-[#aaa]'><i>No Link information</i></p>
              )}
              <Handle type="source" position={Position.Bottom} id="anchor-node" />
            </div>
          )}
          {
            label === 'Web Service' &&
            <div className='p-2'>
              <Handle type="target" position={Position.Top} id='web-service' />
              <p className='text-[#555]'>Service API</p>
              <p className='mt-1 text-sm'>{nodedata.api_url}</p>
              <Handle type="source" position={Position.Bottom} id="web-service" />
            </div>
          }

        </div>
      </div>
    </>
  );
}

export default memo(CustomNode);
