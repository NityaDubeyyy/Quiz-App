import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';
import { data } from '../../assets/data.js';
import * as THREE from 'three';

const Quiz = () => {
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(data[index]);
  const [lock, setLock] = useState(false);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const animationFrameRef = useRef(null);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a192f); // Professional dark blue background
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Create main particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x64ffda, // Professional teal color
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add floating cubes
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.6,
      shininess: 100
    });

    const cubes = [];
    for(let i = 0; i < 10; i++) {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      cube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(cube);
      cubes.push(cube);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0x64ffda, 1);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    camera.position.z = 2;
    
    // Animation
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Rotate particles
      particlesMesh.rotation.x += 0.0003;
      particlesMesh.rotation.y += 0.0003;

      // Animate cubes
      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
      });

      // Rotate point light
      pointLight.position.x = Math.sin(Date.now() * 0.001) * 2;
      pointLight.position.z = Math.cos(Date.now() * 0.001) * 2;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      cubeGeometry.dispose();
      cubeMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    setQuestion(data[index]);
    setLock(false);

    option_array.forEach(option => {
      if (option.current) {
        option.current.classList.remove('correct', 'wrong');
      }
    });
  }, [index]);

  const checkAnswer = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add('correct');
      } else {
        e.target.classList.add('wrong');
        option_array[question.ans - 1].current.classList.add('correct');
      }
      setLock(true);
    }
  };

  const handleNext = () => {
    if (index < data.length - 1) {
      setIndex(index + 1);
    } else {
      alert('Quiz completed!');
    }
  };

  return (
    <div className="container" ref={containerRef}>
      <div className="quiz-content">
        <h1>Quiz App</h1>
        <hr />
        <h2>{index + 1}. {question.question}</h2>
        <ul>
          <li ref={Option1} onClick={(e) => checkAnswer(e, 1)} className="option">1. {question.option1}</li>
          <li ref={Option2} onClick={(e) => checkAnswer(e, 2)} className="option">2. {question.option2}</li>
          <li ref={Option3} onClick={(e) => checkAnswer(e, 3)} className="option">3. {question.option3}</li>
          <li ref={Option4} onClick={(e) => checkAnswer(e, 4)} className="option">4. {question.option4}</li>
        </ul>

        <button onClick={handleNext} disabled={!lock}>Next</button>
        <div className="index">{index + 1} of {data.length} questions</div>
      </div>
    </div>
  );
};

export default Quiz;
