import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '../../components/CustomNode';
import Navbar from '../../layout/Navbar';
import Toolbar from '../../layout/Toolbar';
import SettingBar from '../../layout/SettingBar';
import ConnectionLine from '../../components/ConnectionLine';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultViewport = { x: 0, y: 0, zoom: 1.2 };
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Starting Point' },
    position: { x: 150, y: 155 },
  },
];
const minimapStyle = {
  height: 120,
};

const nodeTypes = {
  customNode: CustomNode,
};

const Main = () => {
  const location = useLocation();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSettingBar, setShowSettingBar] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [variables, setVariables] = useState([
    { key: 'Company', value: 'ChatBot' },
    { key: 'Name', value: 'Vlady' },
    { key: 'Url', value: 'https://react-flow.com' },
    { key: 'Phone', value: '123145432452364' },
  ]);
  const [conversation, setConversation] = useState([]);

  const nextIdRef = useRef(0); // Use a ref to store the next ID

  const getId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1; // Increment the ref value
    return `dndnode_${id}`;
  };

  useEffect(() => {
    setConversation([{ id: initialNodes[0].id, label: initialNodes[0].data.label, content: initialNodes[0].data.nodedata }]);
  }, [nodes]);

  useEffect(() => {
    if (location.state) {
      if (location.state.action === 'createNew') {
        setNodes(initialNodes);
        setEdges([]);
      } else if (location.state.action === 'loadPrevious') {
        onRestore();
      } else if (location.state.action === 'loadSpecific') {
        const { chatFlowKey } = location.state;
        const flow = JSON.parse(localStorage.getItem(chatFlowKey));
        if (flow.nodes.length > 0) {
          const nodelength = flow.nodes.length - 1;
          const id = flow.nodes[nodelength].id;
          const number = id.split('_').pop();
          nextIdRef.current = parseInt(number) + 1;
        }

        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;

          const restoredNodes = flow.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              setNodes,
              getId,
              selectNode
            }
          }));

          setNodes(restoredNodes);
          setEdges(flow.edges || []);
          if (reactFlowInstance) {
            reactFlowInstance.setViewport({ x, y, zoom });
          } else {
            setTimeout(() => {
              if (reactFlowInstance) {
                reactFlowInstance.setViewport({ x, y, zoom });
              }
            }, 100);
          }
        } else {
          toast.error('Failed to restore the chat flow!');
        }
      }
    }
  }, [location.state, reactFlowInstance]);

  const onConnect = useCallback((params) => {
    // Check if the sourceHandle (output handle) already has a connection
    const sourceHandleConnections = edges.filter(edge => edge.source === params.source && edge.sourceHandle === params.sourceHandle).length;
  
    if (sourceHandleConnections >= 1) {
      alert('Output node can only connect to one node.');
      return;
    }
  
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const selectNode = (props) => {
    setShowSettingBar(false);
    setSelectedNodeData(props);
    if (props.data.label === 'Input') {
      setShowSettingBar(true);
    } else {
      setShowSettingBar(true);
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('type');
      const label = event.dataTransfer.getData('label');
      const sublabel = nodes.data?.sublabel || event.dataTransfer.getData('label');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

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
        case 'Link':
          nodedata['linkText'] = '';
          nodedata['hrefValue'] = '';
          nodedata['linkTarget'] = '';
          break;
        case 'Questions':
          nodedata['qa_q'] = '';
          nodedata['qa_a'] = '';
          break;
        case 'Options':
          nodedata['content'] = [];
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
          nodedata['media_content'] = null;
          nodedata['media_name'] = '';
          break;
        case 'Talk with advisor':
          nodedata['advisorName'] = '';
          nodedata['advisorEmail'] = '';
          break;
        case 'Web Service':
          nodedata['api_url'] = 'https://example...';
          nodedata['api_method'] = 'GET';
          nodedata['api_headers'] = [];
          nodedata['api_body'] = [];
          nodedata['content'] = [
            { source: '', value: 'yes', target: '' },
            { source: '', value: 'no', target: '' },
          ]; // Add default output labels
          break;
        default:
          break;
      }

      const newNode = {
        id: getId(),
        type: 'customNode',
        position,
        data: { label: `${label}`, sublabel: `${sublabel}`, nodedata, setNodes, getId, selectNode },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const exportJson = () => {
    const updatedNodes = nodes.map(node => {
      const outgoingEdges = edges.filter(edge => edge.source === node.id);

      // Update target for the node itself
      node.target = outgoingEdges.map(edge => edge.target).join(', ');

      // Update sourceHandle for options in node.data.nodedata.content
      if (node.data && node.data.nodedata && Array.isArray(node.data.nodedata.content)) {
        node.data.nodedata.content.forEach(option => {
          const edge = outgoingEdges.find(edge => edge.sourceHandle === option.value);
          if (edge) {
            option.target = edge.target;
            option.source = node.id; // Add source field
            option.sourceHandle = edge.sourceHandle; // Assign sourceHandle if found
          } else {
            option.target = ""; // Handle case where there's no matching edge (optional)
            option.sourceHandle = ""; // Ensure sourceHandle is cleared if no match
          }
        });
      }

      // Include the yes and no handles in the JSON for Web Service nodes
      if (node.data.label === 'Web Service') {
        const yesEdge = outgoingEdges.find(edge => edge.sourceHandle === 'yes');
        const noEdge = outgoingEdges.find(edge => edge.sourceHandle === 'no');

        node.data.nodedata.content = [
          {
            source: node.id,
            value: 'yes',
            target: yesEdge ? yesEdge.target : '',
            sourceHandle: 'yes',
          },
          {
            source: node.id,
            value: 'no',
            target: noEdge ? noEdge.target : '',
            sourceHandle: 'no',
          },
        ];
      }

      // Replace id with SourceId
      const { id, ...rest } = node;
      return { source: id, ...rest };
    });

    const obj = { nodes: updatedNodes, links: edges };
    const jsonString = JSON.stringify(obj);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();

    fetch('http://192.168.1.45:7007/api/savedata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonString
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    toast.success('Export successfully!');
  };

  const onSave = async () => {
    const chatFlowName = window.prompt('Enter the name of your chat flow');
    const chatFlowDescription = window.prompt('Enter the description of your chat flow');

    if (chatFlowName) {
      const flow = reactFlowInstance.toObject();
      const flowWithDescription = { ...flow, description: chatFlowDescription };
      localStorage.setItem(`chatflow_${chatFlowName}`, JSON.stringify(flowWithDescription));
      toast.success('Chat Flow Saved Successfully!');
    } else {
      toast.error('Chat Flow name is required to save!');
    }
  };

  const onRestore = async () => {
    const chatFlowKeys = Object.keys(localStorage).filter(key => key.startsWith('chatflow_'));
    const chatFlowNames = chatFlowKeys.map(key => key.replace('chatflow_', ''));
    const selectedChatFlow = window.prompt(`Enter the name of the chat flow to restore:\n${chatFlowNames.join('\n')}`);

    if (selectedChatFlow) {
      const flow = JSON.parse(localStorage.getItem(`chatflow_${selectedChatFlow}`));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        const restoredNodes = flow.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            setNodes,
            getId,
            selectNode
          }
        }));

        setNodes(restoredNodes);
        setEdges(flow.edges || []);
        if (reactFlowInstance) {
          reactFlowInstance.setViewport({ x, y, zoom });
        } else {
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.setViewport({ x, y, zoom });
            }
          }, 100);
        }
      } else {
        toast.error('No such Chat Flow found!');
      }
    } else {
      toast.error('Chat Flow name is required to restore!');
    }
  };

  return (
    <div className='sm:ml-64 h-full mt-16'>
      <Navbar exportJson={exportJson} onSave={onSave} onRestore={onRestore} />
      <ReactFlowProvider>
        <div className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            connectionLineComponent={ConnectionLine}
            connectionLineType={ConnectionLineType.SmoothStep}
          >
            <Controls />
            <MiniMap style={minimapStyle} zoomable pannable />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      {showSettingBar ? (
        <SettingBar
          setShowSettingBar={setShowSettingBar}
          selectedNodeData={selectedNodeData}
          variables={variables}
          setVariables={setVariables}
          nodes={nodes}
        />
      ) : (
        <Toolbar />
      )}
    </div>
  );
};

export default Main;
