import React, { useState, useRef, useCallback, useEffect } from 'react';
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

const flowKey = 'chatbot-flow';

let id = 0;
const getId = () => `dndnode_${id++}`;
const nodeTypes = {
  customNode: CustomNode,
};

const Main = () => {
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

  useEffect(() => {
    setConversation([{ id: initialNodes[0].id, label: initialNodes[0].data.label, content: initialNodes[0].data.nodedata }]);
  }, [nodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const selectNode = (props) => {
    setSelectedNodeData(props);
    setShowSettingBar(true);
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('type');
      const label = event.dataTransfer.getData('label');

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
        case 'Date Time':
          nodedata['content'] = '';
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
          nodedata['api_params'] = [];
          nodedata['api_res_variable'] = null;
          nodedata['api_res_data'] = null;
          break;
        default:
          break;
      }

      const newNode = {
        id: getId(),
        type: 'customNode',
        position,
        data: { label: `${label}`, nodedata, setNodes, getId, selectNode },
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
          const edge = outgoingEdges.find(edge => edge.sourceHandle === option.id);
          if (edge) {
            option.target = edge.target;
            option.sourceHandle = edge.sourceHandle; // Assign sourceHandle if found
          } else {
            option.target = ""; // Handle case where there's no matching edge (optional)
            option.sourceHandle = ""; // Ensure sourceHandle is cleared if no match
          }
        });
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
  
    // Log the payload before sending it to the API
    console.log("Payload being sent to the API:", obj);
  
    // Send the JSON data to the API endpoint
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
  };

  const onSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  };

  const onRestore = () => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));
  
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        
        // Ensure selectNode is included in restored nodes
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
        setTimeout(() => reactFlowInstance.setViewport({ x, y, zoom }), 100);
      }
    };
  
    if (reactFlowInstance) {
      restoreFlow();
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
        />
      ) : (
        <Toolbar />
      )}
    </div>
  );
};

export default Main;
