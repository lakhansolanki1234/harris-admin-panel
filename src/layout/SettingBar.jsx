import React, { useState, useEffect } from 'react';
import RichTextEditor from 'react-rte';
import { toast } from 'react-toastify';

const toolbarConfig = {
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
  INLINE_STYLE_BUTTONS: [
    { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' }
  ],
};

function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function SettingBar({ setShowSettingBar, selectedNodeData, setVariables, variables, nodes }) {
  const { data, id } = selectedNodeData;
  const { setNodes, sublabel, label, nodedata } = data;
  const [sublabel1, setsublabel] = useState(sublabel);

  const [selectOptions, setSelectOptions] = useState([...variables]);
  const [messageContent, setMessageContent] = useState(RichTextEditor.createEmptyValue());
  const [qaQuestion, setQaQuestion] = useState(RichTextEditor.createEmptyValue());
  const [qaAnswer, setQaAnswer] = useState('default');
  const [optionsData, setOptionsData] = useState([]);
  const [quAnswerHeader, setQuAnswerHeader] = useState('');
  const [quAnswerFooter, setQuAnswerFooter] = useState('');
  const [quContent, setQuContent] = useState(RichTextEditor.createEmptyValue());
  const [quData, setQuData] = useState([]);
  const [answerContent, setAnswerContent] = useState(RichTextEditor.createEmptyValue());
  const [answerButtons, setAnswerButtons] = useState([]);
  const [media, setMedia] = useState({ data: null, type: '', fileName: '' });

  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('get');
  const [apiParams, setApiParams] = useState([{ key: '', value: '' }]);
  const [apiHeaders, setApiHeaders] = useState([{ key: '', value: '' }]);
  const [resApiVariable, setResApiVariable] = useState(variables[0]?.key);
  const [datetime, setdate] = useState(formatDateTime(new Date()));
  const [advisorName, setAdvisorName] = useState('');
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [linkText, setLinkText] = useState('');
  const [hrefValue, setHrefValue] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [dateTimeOption, setDateTimeOption] = useState(nodedata.dateTimeOption || 'dateTime');
  const [maxchar, setmaxchar] = useState('');

  // State for validation
  const [apiUrlError, setApiUrlError] = useState(false);
  const [apiParamsError, setApiParamsError] = useState(false);
  const [apiMethodError, setApiMethodError] = useState(false);
  const [apiResponsesError, setApiResponsesError] = useState(false);

  // State for send response
  const [apiResponses, setApiResponses] = useState([{ key: '', value: '', type: '' }]);

  const dropdownOptions = nodes
    .filter(node => node.data.label === 'Input' || node.data.label === 'Date Time')
    .map(node => ({
      value: node.id,
      text: node.data.sublabel
    }));

  const handleOptionChange = (index, value) => {
    const newOptionsData = [...optionsData];
    newOptionsData[index].name = value;
    setOptionsData(newOptionsData);
  };

  const handleOptionContentChange = (sectionIndex, optionIndex, value) => {
    const newOptionsData = [...optionsData];
    newOptionsData[sectionIndex].data[optionIndex].value = value;
    setOptionsData(newOptionsData);
  };

  const addOption = (sectionIndex) => {
    const newOptionsData = [...optionsData];
    const section = newOptionsData[sectionIndex];
    const newOption = { id: `option${section.data.length}`, value: 'option' };
    section.data.push(newOption);
    setOptionsData(newOptionsData);
  };

  const removeOption = (sectionIndex, optionIndex) => {
    const newOptionsData = [...optionsData];
    newOptionsData[sectionIndex].data.splice(optionIndex, 1);
    setOptionsData(newOptionsData);
  };

  useEffect(() => {
    console.log(nodes);
    console.log(dropdownOptions);
    setQaQuestion(RichTextEditor.createValueFromString(nodedata?.qa_q, 'html'));
    setMessageContent(RichTextEditor.createValueFromString(nodedata?.content, 'html'));
    setAnswerContent(RichTextEditor.createValueFromString(nodedata?.answer_content, 'html'));
    setQuContent(RichTextEditor.createValueFromString(nodedata?.qu_content, 'html'));
    setsublabel(sublabel);

    if (nodedata?.content) setdate(nodedata?.content);
    if (nodedata?.qa_a) setQaAnswer(nodedata?.qa_a);
    if (nodedata?.qu_data) setQuData([...nodedata.qu_data]);
    if (nodedata?.content) {
      const newSection = { name: 'Section', data: nodedata.content, selectedOption: -1 };
      setOptionsData([newSection]); // Wrap newSection in an array
    }
    if (nodedata?.qu_header) setQuAnswerHeader(nodedata.qu_header);
    if (nodedata?.qu_footer) setQuAnswerFooter(nodedata.qu_footer);
    if (nodedata?.media_content) setMedia({ ...media, data: nodedata.media_content, type: nodedata.media_type, fileName: nodedata.media_name });
    if (nodedata?.api_url) setApiUrl(nodedata.api_url);
    if (nodedata?.api_method) setApiMethod(nodedata.api_method);
    if (nodedata?.api_body) setApiParams([...nodedata.api_body]);
    if (nodedata?.api_headers) setApiHeaders([...nodedata.api_headers]);
    if (nodedata?.api_res_variable) setResApiVariable(nodedata.api_res_variable);
    if (nodedata?.answer_buttons) setAnswerButtons([...nodedata.answer_buttons]);
    if (nodedata?.dateTimeOption) setDateTimeOption(nodedata.dateTimeOption);
    if (nodedata?.api_responses) setApiResponses([...nodedata.api_responses]);
  }, [id]);

  const variableChangeHandler = (e, type, id) => {
    let newVal = { ...selectOptions[id] };
    if (type === 'key') {
      newVal = { ...selectOptions[id], key: e.target.value };
    } else {
      newVal = { ...selectOptions[id], value: e.target.value };
    }
    selectOptions[id] = newVal;
    setSelectOptions([...selectOptions]);
  };

  const mediaUploadHandler = (e) => {
    let file = e.target.files[0];
    if (file.type.includes('video') || file.type.includes("audio")) {
      setMedia({ ...media, type: file.type.includes('video') ? "video" : "audio", data: file, fileName: file.name });
    } else if (file.type.includes('image')) {
      setMedia({ ...media, type: "image", data: file, fileName: file.name });
    } else {
      setMedia({ ...media, type: "document", data: file, fileName: file.name });
    }
  };

  const save = (type) => {
    // Validation for required fields
    let valid = true;

    if (type === 'web') {
      setApiUrlError(!apiUrl);
      setApiMethodError(!apiMethod);
      setApiParamsError(apiParams.some(param => !param.key || !param.value));
      setApiResponsesError(apiResponses.some(res => !res.key || !res.value));

      valid = apiUrl && apiMethod && !apiParams.some(param => !param.key || !param.value) && !apiResponses.some(res => !res.key || !res.value);
    }

    if (!valid) {
      return;
    }

    switch (type) {
      case 'message':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: messageContent.toString('html')
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'Input':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: maxchar
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'date':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: datetime,
                  dateTimeOption: dateTimeOption // Save the dateTimeOption
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'advisor':
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: {
                    ...node.data.nodedata.content,
                    advisorName,
                    advisorEmail,
                  },
                },
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'question-answer':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  qa_q: qaQuestion.toString('html'),
                  qa_a: qaAnswer,
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'options':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: optionsData[0].data
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'anchor':
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  content: {
                    ...node.data.nodedata.content,
                    linkText,
                    hrefValue,
                    linkTarget,
                  },
                },
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'quick-answer':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  qu_data: quData,
                  qu_content: quContent.toString('html'),
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'answer-text':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  answer_content: answerContent.toString('html'),
                  answer_buttons: answerButtons
                }
              };
            }
            return node;
          })
        );
        break;
      case 'media':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  media_content: media.data,
                  media_type: media.type,
                  media_name: media.fileName,
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      case 'web':
        setNodes(nds =>
          nds.map((node) => {
            if (node.id === id) {
              node.data = {
                ...node.data,
                sublabel: sublabel1,
                nodedata: {
                  ...node.data.nodedata,
                  api_url: apiUrl,
                  api_method: apiMethod,
                  api_headers: apiHeaders,
                  api_body: apiParams,
                  api_responses: apiResponses
                }
              };
            }
            return node;
          })
        );
        toast.success('Saved successfully!');
        break;
      default:
        break;
    }
  };

  const handleChange = (e) => {
    setdate(e.target.value);
  };

  const cancel = (type) => {
    switch (type) {
      case 'message':
        setMessageContent(RichTextEditor.createEmptyValue());
        setShowSettingBar(false);
        break;
      case 'Input':
        setmaxchar('');
        setShowSettingBar(false);
        break;
      case 'date':
        setdate('');
        setShowSettingBar(false);
        break;
      case 'question-answer':
        setQaQuestion(RichTextEditor.createEmptyValue());
        setQaAnswer(variables[0]?.value);
        setShowSettingBar(false);
        break;
      case 'options':
        setOptionsData([]);
        setShowSettingBar(false);
        break;
      case 'quick-answer':
        setQuData([]);
        setShowSettingBar(false);
        break;
      case 'answer-text':
        setShowSettingBar(false);
        setAnswerContent(RichTextEditor.createEmptyValue());
        setAnswerButtons([]);
        break;
      case 'media':
        setShowSettingBar(false);
        setMedia({ data: null, type: '', fileName: '' });
        break;
      case 'advisor':
        setShowSettingBar(false);
        setAdvisorEmail('');
        setAdvisorName('');
        break;
      case 'anchor':
        setShowSettingBar(false);
        setAdvisorEmail('');
        setAdvisorName('');
        break;
      case 'web':
        setShowSettingBar(false);
        setApiUrl('');
        setApiMethod('');
        setApiParams([]);
        setApiHeaders([]);
        setResApiVariable(variables[0]?.key);
        setApiResponses([{ key: '', value: '', type: '' }]);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button data-drawer-target="sidebar-multi-level-sidebar" data-drawer-toggle="sidebar-multi-level-sidebar"
        aria-controls="sidebar-multi-level-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ml-3 
      text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 
      dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 a.75 0 010 1.5H2.75A.75.75 a.75 0 012 4.75zm0 10.5a.75.75 a.75 0 01.75-.75h7.5a.75.75 a.75 0 010 1.5h-7.5a.75.75 a.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 a.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
        </svg>
      </button>

      <aside id="sidebar-multi-level-sidebar" className="fixed top-[76px] left-0 z-40 w-80 h-screen transition-transform 
      -translate-x-full sm:translate-x-0 border-r bg-white border-gray-200" aria-label="Sidebar">
        <div className="h-full overflow-y-auto">
          <div className='settings-header'>
            <div className='flex items-center m-2'>
              {label === 'Message' && <img src="imgs/message-icon.png" className='w-2/3' alt="Message Icon" width={24} />}
              {label === 'Questions' && <img src="imgs/ask-icon.png" className='w-2/3' alt="Question Icon" width={24} />}
              {label === 'Options' && <img src="imgs/options-icon.png" className='w-2/3' alt="Options Icon" width={24} />}
              {label === 'Quick Answers' && <img src="imgs/qa-icon.png" className='w-2/3' alt="Quick Answers Icon" width={24} />}
              {label === 'Answer with Text' && <img src="imgs/text-icon.png" className='w-2/3' alt="Answer with Text Icon" width={24} />}
              {label === 'Upload Media' && <img src="imgs/media-icon.png" className='w-2/3' alt="Upload Media Icon" width={24} />}
              {label === 'Talk with advisor' && <img src="imgs/talk-icon.png" className='w-2/3' alt="Talk with Advisor Icon" width={24} />}
              {label === 'Web Service' && <img src="imgs/web-icon.png" className='w-2/3' alt="Web Service Icon" width={24} />}
              {label === 'Date Time' && <img src="imgs/schedule-icon.png" className='w-2/3' alt="Date Time Icon" width={24} />}
              {label === 'Link' && <img src="imgs/broken-link-10497.png" className='w-2/3' alt="Link Icon" width={24} />}
              {label === 'Input' && <img src="imgs/message-icon.png" className='w-2/3' alt="Message Icon" width={24} />}
              <div></div>
            </div>
            <div className='my-2 mx-4' >
              <input
                type='text'
                value={sublabel1}
                onChange={(e) => setsublabel(e.target.value)}
                className="ml-2 w-52 p-2 border-x-2 border-y-2 rounded py-2 "
                placeholder="Enter sublabel"
              />
            </div>
          </div>
          <div className='settings-body py-2 px-2 border-x-2'>
            {label === 'Message' &&
              <>
                <RichTextEditor
                  value={messageContent}
                  placeholder='Edit here ...'
                  onChange={(value) => { setMessageContent(value) }}
                  toolbarConfig={toolbarConfig}
                  className="font-[400] custom-rich-editor"
                />
                <div className='settings-footer py-2'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold m-1 hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('message')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold m-1 hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('message')}>Cancel</button>
                </div>
              </>
            }
            {label === 'Date Time' &&
              <div>
                <input
                  type='datetime-local'
                  value={datetime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-4"
                />
                <div className="mt-2">
                  <label className="block mb-2">
                    <input
                      type="radio"
                      value="date"
                      checked={dateTimeOption === 'date'}
                      onChange={(e) => { setDateTimeOption(e.target.value); setsublabel('Date') }}
                      className="mr-2"
                    />
                    Date
                  </label>
                  <label className="block mb-2">
                    <input
                      type="radio"
                      value="time"
                      checked={dateTimeOption === 'time'}
                      onChange={(e) => { setDateTimeOption(e.target.value); setsublabel('Time') }}
                      className="mr-2"
                    />
                    Time
                  </label>
                  <label className="block mb-2">
                    <input
                      type="radio"
                      value="dateTime"
                      checked={dateTimeOption === 'dateTime'}
                      onChange={(e) => { setDateTimeOption(e.target.value); setsublabel('Date And Time') }}
                      className="mr-2"
                    />
                    Date and Time
                  </label>
                </div>
                <div className='settings-footer py-2'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 m-1 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('date')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 m-1 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('date')}>Cancel</button>
                </div>
              </div>
            }
            {label === 'Questions' &&
              <>
                <p className='pl-2 pt-2 text-sm'>Question Text</p>
                <RichTextEditor
                  value={qaQuestion}
                  placeholder='Edit here ...'
                  onChange={(value) => { setQaQuestion(value) }}
                  toolbarConfig={toolbarConfig}
                  className="font-[400] custom-rich-editor"
                />
                <p className='pl-2 py-2 text-sm text-[#555]'>Save answers in the variable</p>
                <div className='w-full px-2'>
                  <select id="answer_vals" className="pl-6 bg-gray-50 border w-full border-gray-300 text-gray-600 text-sm rounded-lg 
                  outline-none focus:ring-blue-500 focus:border-blue-500 block p-2.5" value={qaAnswer} onChange={(e) => setQaAnswer(e.target.value)}>
                    <option value={'default'}>Select Variable</option>
                    {variables.map((da, id) =>
                      <option key={id} selected={qaAnswer === da.key} value={da.key}>
                        @&nbsp;{da.key}
                      </option>
                    )}
                  </select>
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('question-answer')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('question-answer')}>Cancel</button>
                </div>
                <hr className='mt-2' />
                <p className='pl-2 pt-2 text-sm text-[#555]'>Set Variables</p>
                <div className='mt-2'>
                  {selectOptions.map((data, id) => (
                    <li className='flex justify-between text-sm text-[#333] mt-1 mr-1'>
                      <input value={data.key} className="text-left border p-1 w-20 ml-2 outline-none focus:border-gray-400 mr-1"
                        onChange={(e) => variableChangeHandler(e, 'key', id)} />
                      :
                      <div className='flex'>
                        <input value={data.value} className=" border p-1 w-32 outline-none focus:border-gray-400 ml-1"
                          onChange={(e) => variableChangeHandler(e, 'value', id)} />
                        <i className='fa fa-trash cursor-pointer hover:text-[#888] mt-2 ml-1' onClick={() => {
                          selectOptions.splice(id, 1);
                          setSelectOptions([...selectOptions]);
                        }}></i>
                      </div>
                    </li>
                  ))}
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-gray-500 hover:border-transparent rounded' onClick={() => {
                      setVariables([...selectOptions]);
                      setQaAnswer('default');
                      toast.success('Variables are applied successfully');
                    }}>Apply</button>
                  <button className='bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-gray-500 hover:border-transparent rounded' onClick={() => {
                      let obj = { key: 'Key', value: 'value' };
                      selectOptions.push(obj);
                      setSelectOptions([...selectOptions]);
                    }}>Add new</button>
                </div>
              </>
            }
            {label === 'Options' && (
              <>
                <p className='text-[#888] text-sm p-2'>Menu List</p>
                <div className='px-2'>
                  {optionsData.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <div className='flex justify-between items-center text-white my-1 text-left bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-md shadow-cyan-500/50 font-medium rounded text-sm w-full px-2 py-2.5 mr-2'>
                        <input
                          value={section.name}
                          className='outline-none bg-transparent placeholder-gray-200'
                          placeholder='Click to edit section'
                          readOnly
                          onChange={(e) => handleOptionChange(sectionIndex, e.target.value)}
                        />
                        <div className='flex'>
                          <i className='fa fa-plus mr-2 mt-1 cursor-pointer hover:text-[#ccc]' onClick={() => addOption(sectionIndex)}></i>
                        </div>
                      </div>
                      {section.data.length > 0 &&
                        section.data.map((option, optionIndex) => (
                          <div
                            className='text-white flex text-xs justify-between items-center bg-red-700 w-full hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium px-3 rounded py-1.5 mb-1'
                            key={option.id}
                          >
                            <input
                              value={option.value}
                              className='outline-none bg-transparent placeholder-gray-200 w-full'
                              placeholder='Click to edit option'
                              onChange={(e) => handleOptionContentChange(sectionIndex, optionIndex, e.target.value)}
                            />
                            <div className='flex'>
                              <i className='fa fa-trash mt-1 cursor-pointer hover:text-[#ccc]' style={{ fontSize: 12 }} onClick={() => removeOption(sectionIndex, optionIndex)}></i>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                  <div className=' flex-col mt-4 justify-end'>
                    <button className='mx-1 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('options')}>Save</button>
                    <button className='mx-1 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('options')}>Cancel</button>
                  </div>
                </div>
              </>
            )}

            {label === 'Quick Answers' &&
              <>
                <input value={quAnswerHeader} onChange={(e) => setQuAnswerHeader(e.target.value)} placeholder="click to edit footer"
                  className='bg-[#336699] text-white w-full text-sm p-1 py-2 outline-none font-semibold placeholder-slate-400' />
                <RichTextEditor
                  value={quContent}
                  placeholder='Edit here ...'
                  onChange={(value) => { setQuContent(value) }}
                  toolbarConfig={toolbarConfig}
                  className="font-[400] custom-rich-editor"
                />
                <input value={quAnswerFooter} onChange={(e) => setQuAnswerFooter(e.target.value)} placeholder="click to edit footer"
                  className='bg-[#336699] text-white w-full text-sm p-1 py-2 outline-none font-semibold placeholder-slate-400' />
                <div className='px-2 pb-2'>
                  {quData.map((data, no) => (
                    <div key={no} className='flex justify-between text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 
                      focus:ring-4 focus:ring-gray-200 rounded text-sm px-4 py-2 mr-2 mt-2'>
                      <input value={data.name} className='outline-none bg-transparent placeholder-gray-200'
                        placeholder='click to edit' onChange={(e) => {
                          quData[no].name = e.target.value;
                          setQuData([...quData]);
                        }} />
                      <i className='fa fa-trash mt-1 cursor-pointer hover:text-[#ccc]' onClick={() => {
                        quData.splice(no, 1);
                        setQuData([...quData]);
                      }}></i>
                    </div>
                  ))}
                  <button onClick={() => {
                    if (quData.length >= 3) {
                      toast.warn('You can\'t add new button anymore.');
                      return;
                    }
                    let newButton = { name: `Button`, data: {} };
                    quData.push(newButton);
                    setQuData([...quData]);
                  }} className='w-full text-white bg-gradient-to-r from-purple-500 via-purple-600 
                  to-purple-700 hover:bg-gradient-to-br focus:outline-none focus:ring-purple-300 font-medium rounded-full 
                  text-sm px-4 py-1.5 text-center mt-2'>
                    <i className='fa fa-plus mr-2' style={{ fontSize: 12 }}></i> Add new button
                  </button>
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('quick-answer')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('quick-answer')}>Cancel</button>
                </div>
              </>
            }
            {label === 'Answer with Text' &&
              <>
                <RichTextEditor
                  value={answerContent}
                  placeholder='Edit here ...'
                  onChange={(value) => { setAnswerContent(value) }}
                  toolbarConfig={toolbarConfig}
                  className="font-[400] custom-rich-editor"
                />
                <div className='px-2 pb-2'>
                  {answerButtons.map((data, no) => (
                    <div key={no} className='flex justify-between text-[#9d174d] bg-white border border-[#9d174d] focus:outline-none hover:bg-[#9d174d] 
                      focus:ring-4 focus:ring-gray-200 rounded text-sm px-4 py-2 mr-2 mt-2 hover:text-white cursor-pointer'>
                      <input value={data.name} className='outline-none bg-transparent placeholder-gray-400'
                        placeholder='click to edit' onChange={(e) => {
                          answerButtons[no].name = e.target.value;
                          setAnswerButtons([...answerButtons]);
                        }} />
                      <i className='fa fa-trash mt-1 cursor-pointer hover:text-[#ccc]' onClick={() => {
                        answerButtons.splice(no, 1);
                        setAnswerButtons([...answerButtons]);
                      }}></i>
                    </div>
                  ))}
                  <button onClick={() => {
                    let newButton = { name: `Button`, data: {} };
                    answerButtons.push(newButton);
                    setAnswerButtons([...answerButtons]);
                  }} className='w-full text-white bg-gradient-to-r from-purple-500 via-purple-600 
                  to-purple-700 hover:bg-gradient-to-br focus:outline-none focus:ring-purple-300 font-medium rounded-full 
                  text-sm px-4 py-1.5 text-center mt-2'>
                    <i className='fa fa-plus mr-2' style={{ fontSize: 12 }}></i> Add new button
                  </button>
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('answer-text')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('answer-text')}>Cancel</button>
                </div>
              </>
            }
            {label === 'Upload Media' &&
              <div>
                <p className='text-[#555] text-sm p-3'>Media File</p>
                {media.data ?
                  <div className='relative border rounded m-2'>
                    <button className='border rounded-full h-5 w-5 z-10 absolute top-1 right-1 font-[500] flex justify-center items-center'
                      onClick={() => { setMedia({ data: null, type: '', fileName: '' }) }}><i className='fa fa-close' style={{ fontSize: 12 }} ></i></button>
                    {media.type === 'video' ?
                      <video className='w-full h-auto' controls>
                        <source src={URL.createObjectURL(media.data)} type="video/mp4" />
                      </video>
                      :
                      media.type === 'image'
                        ? <img src={URL.createObjectURL(media.data)} className='w-full h-auto' alt='B' />
                        : <div className='p-2 py-4 text-sm'>{media.fileName}</div>
                    }
                  </div>
                  :
                  <div className="flex items-center justify-center w-full p-2">
                    <label htmlFor="dropzone-file1" className="w-full h-full border-0 bg-[#F0F2F4] py-10">
                      <div className="flex flex-col items-center justify-center w-fit h-auto z-[5] relative mx-auto rounded-lg cursor-pointer bg-white hover:bg-[#fafafa]">
                        <img src={'/imgs/empty-img.png'} className='border-0 rounded-lg w-10' />
                      </div>
                      <p className='w-full text-center text-xs text-[#888] mt-1'>File Upload</p>
                      <input id="dropzone-file1" type="file" className="hidden" onChange={mediaUploadHandler} name='nftfile' />
                    </label>
                  </div>
                }
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('media')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 
                  px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('media')}>Cancel</button>
                </div>
              </div>
            }
            {label === 'Talk with advisor' && (
              <>
                <div className='p-2'>
                  <div className='mb-4'>
                    <p className='text-[#555] text-sm'>Advisor Name</p>
                    <input
                      type='text'
                      className='font-[500] mt-2 p-1 border rounded'
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      placeholder='Enter advisor name'
                    />
                  </div>
                  <div>
                    <p className='text-[#555] text-sm'>Advisor Email</p>
                    <input
                      type='email'
                      className='font-[500] mt-2 p-1 border rounded'
                      value={advisorEmail}
                      onChange={(e) => setAdvisorEmail(e.target.value)}
                      placeholder='Enter advisor email'
                    />
                  </div>
                </div>
                <div className='flex mt-2 justify-end'>
                  <button className='mx-1 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 
                px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('advisor')}>Save</button>
                  <button className='mx-1 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 
                px-4 text-sm border border-red-500 hover:border-transparent rounded mr-2' onClick={() => cancel('advisor')}>Cancel</button>
                </div>
              </>
            )}
            {label === 'Link' && (
              <>
                <div className='p-2'>
                  <div className='mb-4'>
                    <p className='text-[#555] text-sm'>Link Text</p>
                    <input
                      type='text'
                      className='font-[500] mt-2 p-1 border rounded'
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder='Enter link text'
                    />
                  </div>
                  <div>
                    <p className='text-[#555] text-sm'>Link Href</p>
                    <input
                      type='text'
                      className='font-[500] mt-2 p-1 border rounded'
                      value={hrefValue}
                      onChange={(e) => setHrefValue(e.target.value)}
                      placeholder='Enter link href'
                    />
                  </div>
                  <div className='mt-4'>
                    <p className='text-[#555] text-sm'>Link Target</p>
                    <select
                      className='font-[500] mt-2 p-1 border rounded'
                      value={linkTarget}
                      onChange={(e) => setLinkTarget(e.target.value)}
                    >
                      <option value='_self'>Self</option>
                      <option value='_blank'>Blank</option>
                      <option value='_parent'>Parent</option>
                      <option value='_top'>Top</option>
                    </select>
                  </div>
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('anchor')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('anchor')}>Cancel</button>
                </div>
              </>
            )}
            {label === 'Input' && (
              <>
                <div className='p-2'>
                  <div>
                    <p className='text-[#555] text-sm'>Max Characters</p>
                    <input
                      type='number'
                      className='font-[500] mt-2 p-1 border rounded'
                      value={maxchar}
                      onChange={(e) => setmaxchar(e.target.value)}
                    />
                  </div>
                </div>
                <div className='settings-footer'>
                  <button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 text-sm border border-blue-500 hover:border-transparent rounded' onClick={() => save('Input')}>Save</button>
                  <button className='bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-4 text-sm border border-red-500 hover:border-transparent rounded' onClick={() => cancel('Input')}>Cancel</button>
                </div>
              </>
            )}
            {label === 'Web Service' &&
              <div className='p-2 w-76'>
                <p className='text-[#555] text-sm px-1'>Web Hook Settings</p>
                <div className='body border text-sm p-1 mt-2'>
                  <p className='mb-2 text-sm'>URL & Method<span className="text-red-500">*</span></p>
                  <strong className='text-xs'>Select the method and type the url<span className="text-red-500">*</span></strong>
                  <div className='relative'>
                    <select
                      id="answer_vals"
                      className={`w-20 absolute cursor-pointer ${apiMethodError ? 'border-red-500' : 'bg-[#4338ca]'} border-0 text-white outline-none block p-1`}
                      onChange={(e) => setApiMethod(e.target.value)}
                      value={apiMethod}
                    >
                      <option value="get">GET</option>
                      <option value="post">POST</option>
                      <option value="put">PUT</option>
                      <option value="delete">DELETE</option>
                    </select>
                    <input
                      className={`pl-[76px] text-left border p-1 w-full word-wrap overflow-wrap outline-none focus:border-gray-400 mr-1 ${apiUrlError ? 'border-red-500' : ''}`}
                      onChange={(e) => setApiUrl(e.target.value)}
                      value={apiUrl}
                    />
                  </div>
                  <hr className='my-2' />
                  {apiMethod !== 'get' && (
                    <>
                      <p className='mb-2 text-sm'>Send body<span className="text-red-500">*</span></p>
                      {apiParams.map((val, no) => (
                        <div className='flex justify-between' key={no}>
                          <div className='flex justify-between w-full'>
                            <div className='w-1/2 mr-1'>
                              <p className='text-xs'>Key<span className="text-red-500">*</span></p>
                              <input
                                className={`text-left border p-1 w-full outline-none focus:border-gray-400 mr-1 ${apiParamsError && !val.key ? 'border-red-500' : ''}`}
                                value={val.key}
                                onChange={(e) => {
                                  const newParams = [...apiParams];
                                  newParams[no].key = e.target.value;
                                  setApiParams(newParams);
                                }}
                              />
                            </div>
                            <div className='w-1/2'>
                              <p className='text-xs'>Value<span className="text-red-500">*</span></p>
                              <select
                                className={`text-left border p-1 w-full outline-none focus:border-gray-400 mr-1 ${apiParamsError && !val.value ? 'border-red-500' : ''}`}
                                value={val.value}
                                onChange={(e) => {
                                  const newParams = [...apiParams];
                                  newParams[no].value = e.target.value;
                                  setApiParams(newParams);
                                }}
                              >
                                <option>Select one of these</option>
                                {dropdownOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.text}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className='py-5 px-1'>
                            <i
                              className='fa fa-trash mt-1 cursor-pointer hover:text-[#888]'
                              onClick={() => {
                                const newParams = apiParams.filter((_, index) => index !== no);
                                setApiParams(newParams);
                              }}
                            ></i>
                          </div>
                        </div>
                      ))}
                      <button
                        className='bg-transparent hover:bg-[#4338ca] text-[#4338ca] font-semibold hover:text-white py-1 px-4 text-xs border border-[#4338ca] hover:border-transparent rounded'
                        onClick={() => {
                          setApiParams([...apiParams, { key: '', value: '' }]);
                        }}
                      >
                        <i className='fa fa-plus mr-1'></i>Add New
                      </button>
                    </>
                  )}
                  <hr className='my-2' />
                  <p className='mb-2 text-sm'>Send Response (if successful)<span className="text-red-500">*</span></p>
                  {apiResponses.map((res, no) => (
                    <div className='flex justify-between' key={no}>
                      <div className='flex justify-between w-full'>
                        <div className='w-1/4 mr-1'>
                          <p className='text-xs'>Key<span className="text-red-500">*</span></p>
                          <input
                            className={`text-left border p-1 w-full outline-none focus:border-gray-400 mr-1 ${apiResponsesError && !res.key ? 'border-red-500' : ''}`}
                            value={res.key}
                            onChange={(e) => {
                              const newResponses = [...apiResponses];
                              newResponses[no].key = e.target.value;
                              setApiResponses(newResponses);
                            }}
                          />
                        </div>
                        <div className='w-1/3'>
                          <p className='text-xs'>Type<span className="text-red-500">*</span></p>
                          <select
                            className={`text-left border p-1 w-full outline-none focus:border-gray-400 mr-1 ${apiResponsesError && !res.type ? 'border-red-500' : ''}`}
                            value={res.type}
                            onChange={(e) => {
                              const newResponses = [...apiResponses];
                              newResponses[no].type = e.target.value;
                              setApiResponses(newResponses);
                            }}
                          >
                            <option value=''>Choose one of these</option>
                            <option value='Text'>Text</option>
                            <option value='Number'>Number</option>
                            <option value='AutoGenratedId'>Auto Genrated Id</option>
                          </select>
                        </div>
                        <div className='w-1/4 mr-1'>
                          <p className='text-xs'>Value</p>
                          <input
                            className='text-left border p-1 w-full outline-none focus:border-gray-400 mr-1'
                            value={res.value}
                            onChange={(e) => {
                              const newResponses = [...apiResponses];
                              newResponses[no].value = e.target.value;
                              setApiResponses(newResponses);
                            }}
                            disabled={res.type === 'AutoGeneratedId'} // Disable input when type is AutoGeneratedId
                          />
                        </div>

                      </div>
                      <div className='py-5 px-1'>
                        <i
                          className='fa fa-trash mt-1 cursor-pointer hover:text-[#888]'
                          onClick={() => {
                            const newResponses = apiResponses.filter((_, index) => index !== no);
                            setApiResponses(newResponses);
                          }}
                        ></i>
                      </div>
                    </div>
                  ))}
                  <button
                    className='bg-transparent hover:bg-[#4338ca] text-[#4338ca] font-semibold hover:text-white py-1 px-4 text-xs border border-[#4338ca] hover:border-transparent rounded'
                    onClick={() => {
                      setApiResponses([...apiResponses, { key: '', value: '', type: '' }]);
                    }}
                  >
                    <i className='fa fa-plus mr-1'></i>Add New
                  </button>

                  <hr className='my-2' />
                  <p className='mb-2 text-sm'>Send Headers</p>
                  {apiHeaders.map((val, no) => (
                    <div className='flex justify-between flex' key={no}>
                      <div className='flex justify-between w-full'>
                        <div className='w-1/2 mr-1'>
                          <p className='text-xs'>Key</p>
                          <input
                            className='text-left border p-1 w-full outline-none focus:border-gray-400 mr-1'
                            value={val.key}
                            onChange={(e) => {
                              const newHeaders = [...apiHeaders];
                              newHeaders[no].key = e.target.value;
                              setApiHeaders(newHeaders);
                            }}
                          />
                        </div>
                        <div className='w-1/2'>
                          <p className='text-xs'>Value</p>
                          <input
                            className='text-left border p-1 w-full outline-none focus:border-gray-400 mr-1'
                            value={val.value}
                            onChange={(e) => {
                              const newHeaders = [...apiHeaders];
                              newHeaders[no].value = e.target.value;
                              setApiHeaders(newHeaders);
                            }}
                          />
                        </div>
                      </div>
                      <div className='py-5 px-1'>
                        <i
                          className='fa fa-trash mt-1 cursor-pointer hover:text-[#888]'
                          onClick={() => {
                            const newHeaders = apiHeaders.filter((_, index) => index !== no);
                            setApiHeaders(newHeaders);
                          }}
                        ></i>
                      </div>
                    </div>
                  ))}
                  <button
                    className='bg-transparent hover:bg-[#4338ca] text-[#4338ca] font-semibold hover:text-white py-1 px-4 text-xs border border-[#4338ca] hover:border-transparent rounded'
                    onClick={() => {
                      setApiHeaders([...apiHeaders, { key: '', value: '' }]);
                    }}
                  >
                    <i className='fa fa-plus mr-1'></i>Add New
                  </button>
                  <hr className='my-2' />
                </div>
                <div className='settings-footer py-2'>
                  <button
                    className='bg-transparent m-1 hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 text-sm border border-blue-500 hover:border-transparent rounded'
                    onClick={() => save('web')}
                  >
                    Save
                  </button>
                  <button
                    className='bg-transparent m-1 hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-4 text-sm border border-red-500 hover:border-transparent rounded'
                    onClick={() => cancel('web')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </aside>
    </>
  );
}

export default SettingBar;
