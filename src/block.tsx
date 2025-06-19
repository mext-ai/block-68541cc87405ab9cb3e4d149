import React, { useState, useEffect } from 'react';

interface Term {
  id: string;
  term: string;
  definition: string;
}

interface Match {
  termId: string;
  definitionId: string;
}

interface BlockProps {
  title?: string;
  description?: string;
}

const Block: React.FC<BlockProps> = ({ title = "Quiz ISO 13485", description }) => {
  // Données des termes et définitions ISO 13485
  const termsData: Term[] = [
    {
      id: '1',
      term: 'Dispositif médical',
      definition: 'Instrument, appareil, équipement, logiciel, implant, réactif, matière ou autre article destiné par le fabricant à être utilisé chez l\'homme à des fins médicales'
    },
    {
      id: '2',
      term: 'SMQ',
      definition: 'Système de Management de la Qualité - ensemble d\'éléments corrélés ou en interaction d\'un organisme, utilisés pour établir des politiques, des objectifs et des processus'
    },
    {
      id: '3',
      term: 'Gestion des risques',
      definition: 'Application systématique de politiques, procédures et pratiques de management aux tâches d\'analyse, d\'évaluation, de maîtrise et de surveillance du risque'
    },
    {
      id: '4',
      term: 'Surveillance post-commercialisation',
      definition: 'Toutes les activités entreprises par les fabricants conjointement avec les distributeurs pour instituer et tenir à jour une procédure systématique'
    },
    {
      id: '5',
      term: 'Validation',
      definition: 'Confirmation par des preuves tangibles que les exigences pour une application ou un usage spécifique prévu ont été satisfaites'
    },
    {
      id: '6',
      term: 'Dossier technique',
      definition: 'Compilation de documents qui démontre la conformité du dispositif médical aux exigences du présent document'
    }
  ];

  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedTerm, setDraggedTerm] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{ correct: number; incorrect: number } | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // Mélanger les définitions pour éviter l'ordre logique
  const [shuffledDefinitions, setShuffledDefinitions] = useState<Term[]>([]);

  useEffect(() => {
    const shuffled = [...termsData].sort(() => Math.random() - 0.5);
    setShuffledDefinitions(shuffled);
  }, []);

  const handleDragStart = (termId: string) => {
    setDraggedTerm(termId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, definitionId: string) => {
    e.preventDefault();
    if (draggedTerm) {
      createMatch(draggedTerm, definitionId);
      setDraggedTerm(null);
    }
  };

  const handleTermClick = (termId: string) => {
    if (selectedTerm === termId) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(termId);
    }
  };

  const handleDefinitionClick = (definitionId: string) => {
    if (selectedTerm) {
      createMatch(selectedTerm, definitionId);
      setSelectedTerm(null);
    }
  };

  const createMatch = (termId: string, definitionId: string) => {
    // Supprimer les correspondances existantes pour ce terme et cette définition
    const newMatches = matches.filter(
      match => match.termId !== termId && match.definitionId !== definitionId
    );
    
    // Ajouter la nouvelle correspondance
    newMatches.push({ termId, definitionId });
    setMatches(newMatches);
  };

  const removeMatch = (matchToRemove: Match) => {
    setMatches(matches.filter(match => 
      !(match.termId === matchToRemove.termId && match.definitionId === matchToRemove.definitionId)
    ));
  };

  const checkAnswers = () => {
    if (matches.length !== termsData.length) {
      alert('Veuillez associer tous les termes avant de vérifier !');
      return;
    }

    let correct = 0;
    let incorrect = 0;

    matches.forEach(match => {
      if (match.termId === match.definitionId) {
        correct++;
      } else {
        incorrect++;
      }
    });

    setAttempts(prev => prev + 1);
    setLastResult({ correct, incorrect });

    if (correct === termsData.length) {
      setIsComplete(true);
      setShowSuccess(true);
      
      // Envoyer l'événement de completion
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'iso-13485-matching-game', 
        completed: true,
        score: correct,
        maxScore: termsData.length,
        attempts: attempts + 1
      }, '*');
      window.parent.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'iso-13485-matching-game', 
        completed: true,
        score: correct,
        maxScore: termsData.length,
        attempts: attempts + 1
      }, '*');

      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const resetGame = () => {
    setMatches([]);
    setLastResult(null);
    setSelectedTerm(null);
    const shuffled = [...termsData].sort(() => Math.random() - 0.5);
    setShuffledDefinitions(shuffled);
  };

  const startNewGame = () => {
    setMatches([]);
    setAttempts(0);
    setLastResult(null);
    setIsComplete(false);
    setSelectedTerm(null);
    const shuffled = [...termsData].sort(() => Math.random() - 0.5);
    setShuffledDefinitions(shuffled);
  };

  const getMatchedDefinitionId = (termId: string) => {
    const match = matches.find(m => m.termId === termId);
    return match?.definitionId;
  };

  const getMatchedTermId = (definitionId: string) => {
    const match = matches.find(m => m.definitionId === definitionId);
    return match?.termId;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {/* Success Animation */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 255, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'pulse 0.5s ease-in-out infinite alternate'
        }}>
          <div style={{
            background: 'white',
            color: '#4CAF50',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            🎉 Félicitations ! 🎉<br/>
            Toutes les réponses sont correctes !<br/>
            <span style={{ fontSize: '18px' }}>
              Réussi en {attempts} tentative{attempts > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Associez les termes ISO 13485 à leurs définitions
        </p>
        
        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '18px'
          }}>
            Tentatives: {attempts}
          </div>
          
          {lastResult && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '18px'
            }}>
              Dernier résultat: {lastResult.correct} ✅ / {lastResult.incorrect} ❌
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '500px'
      }}>
        {/* Terms Column */}
        <div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            fontSize: '1.5rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Termes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {termsData.map(term => {
              const matchedDefId = getMatchedDefinitionId(term.id);
              const isSelected = selectedTerm === term.id;
              
              return (
                <div
                  key={term.id}
                  draggable
                  onDragStart={() => handleDragStart(term.id)}
                  onClick={() => handleTermClick(term.id)}
                  style={{
                    background: isSelected 
                      ? 'rgba(255, 255, 0, 0.3)' 
                      : matchedDefId 
                        ? 'rgba(0, 255, 0, 0.3)' 
                        : 'rgba(255, 255, 255, 0.2)',
                    padding: '20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isSelected ? '3px solid yellow' : matchedDefId ? '2px solid #4CAF50' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    userSelect: 'none',
                    boxShadow: isSelected ? '0 0 15px rgba(255, 255, 0, 0.5)' : '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!matchedDefId) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!matchedDefId && !isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                >
                  {term.term}
                  {matchedDefId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMatch({ termId: term.id, definitionId: matchedDefId });
                      }}
                      style={{
                        marginLeft: '10px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Definitions Column */}
        <div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            fontSize: '1.5rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Définitions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {shuffledDefinitions.map(def => {
              const matchedTermId = getMatchedTermId(def.id);
              
              return (
                <div
                  key={def.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, def.id)}
                  onClick={() => handleDefinitionClick(def.id)}
                  style={{
                    background: matchedTermId 
                      ? 'rgba(0, 255, 0, 0.3)' 
                      : selectedTerm 
                        ? 'rgba(255, 255, 0, 0.1)' 
                        : 'rgba(255, 255, 255, 0.2)',
                    padding: '20px',
                    borderRadius: '10px',
                    cursor: selectedTerm ? 'pointer' : 'default',
                    border: matchedTermId ? '2px solid #4CAF50' : selectedTerm ? '2px dashed yellow' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!matchedTermId && selectedTerm) {
                      e.currentTarget.style.background = 'rgba(255, 255, 0, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!matchedTermId && selectedTerm) {
                      e.currentTarget.style.background = 'rgba(255, 255, 0, 0.1)';
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {def.definition}
                    {matchedTermId && (
                      <div style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#4CAF50'
                      }}>
                        ✓ Associé à: {termsData.find(t => t.id === matchedTermId)?.term}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '30px auto',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <p style={{ fontSize: '16px', margin: '0' }}>
          <strong>Instructions:</strong> Glissez-déposez ou cliquez sur un terme puis sur sa définition pour les associer. 
          Une fois toutes les associations faites, vérifiez vos réponses !
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={checkAnswers}
          disabled={matches.length !== termsData.length}
          style={{
            background: matches.length === termsData.length ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: matches.length === termsData.length ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Vérifier les réponses ({matches.length}/{termsData.length})
        </button>
        
        <button
          onClick={resetGame}
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Réinitialiser
        </button>
        
        <button
          onClick={startNewGame}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Nouvelle partie
        </button>
      </div>

      <style>
        {`
          @keyframes pulse {
            from { opacity: 0.8; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Block;