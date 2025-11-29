import { useState, useEffect } from 'react';
import { createWalletClient, http, verifyMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import './App.css';

interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}
declare global { interface Window { ethereum?: EIP1193Provider; } }
type SignMethod = 'extension' | 'privateKey';
type VerifyResult = 'idle' | 'match' | 'mismatch' | 'error';

// Icons
const IconCheck = () => <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconX = () => <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconAlert = () => <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IconRefresh = () => <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>;

function App() {
  const [signMethod, setSignMethod] = useState<SignMethod>('privateKey');
  const [signMsg, setSignMsg] = useState<string>(
    JSON.stringify({
      app: "Web3 Auth",
      action: "Sign In",
      nonce: 847293,
      timestamp: new Date().toISOString()
    }, null, 2)
  );
  const [privateKey, setPrivateKey] = useState<string>('');

  const [outSig, setOutSig] = useState<string>('');
  const [outAddr, setOutAddr] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string>('');

  const [verifyAddr, setVerifyAddr] = useState<string>('');
  const [verifyMsg, setVerifyMsg] = useState<string>('');
  const [verifySig, setVerifySig] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult>('idle');

  // Reset results when inputs change
  useEffect(() => {
    if (outSig || outAddr || signError) {
      setOutSig('');
      setOutAddr('');
      setSignError('');
    }
  }, [signMsg, privateKey, signMethod]);

  useEffect(() => {
    if (verifyResult !== 'idle') setVerifyResult('idle');
  }, [verifyAddr, verifyMsg, verifySig]);

  const fillVerifier = () => {
    setVerifyResult('idle');
    setVerifyAddr(outAddr);
    setVerifyMsg(signMsg);
    setVerifySig(outSig);
  };

  const handleSign = async () => {
    setIsSigning(true);
    setOutSig('');
    setOutAddr('');
    setSignError('');

    try {
      // Simulate delay for better UX
      await new Promise(r => setTimeout(r, 150));

      let signature = '';
      let address = '';

      if (signMethod === 'privateKey') {
        if (!privateKey.startsWith('0x') || privateKey.length !== 66) throw new Error("Private Key must start with 0x and be 66 characters long.");
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        const client = createWalletClient({ account, chain: sepolia, transport: http() });
        signature = await client.signMessage({ message: signMsg });
        address = account.address;
      } else {
        if (!window.ethereum) throw new Error("Wallet extension not detected.");
        const [addr] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        signature = await window.ethereum.request({ method: 'personal_sign', params: [signMsg, addr] });
        address = addr;
      }
      setOutSig(signature);
      setOutAddr(address);
    } catch (err: any) {
      setSignError(err.message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerify = async () => {
    try {
      const isValid = await verifyMessage({
        address: verifyAddr as `0x${string}`,
        message: verifyMsg,
        signature: verifySig as `0x${string}`
      });
      setVerifyResult(isValid ? 'match' : 'mismatch');
    } catch {
      setVerifyResult('error');
    }
  };

  const hasResult = !!outSig && !!outAddr;

  return (
    <div className="layout">

      {/* === Left Panel: Signer === */}
      <div className="panel">
        <div className="panel-header">
          <h2>Produce Signature</h2>
          <div className="tabs">
            <button className={signMethod === 'privateKey' ? 'active' : ''} onClick={() => setSignMethod('privateKey')}>Private Key</button>
            <button className={signMethod === 'extension' ? 'active' : ''} onClick={() => setSignMethod('extension')}>Extension</button>
          </div>
        </div>

        <div className="field-group">
          <label>Message Payload</label>
          <textarea value={signMsg} onChange={e => setSignMsg(e.target.value)} spellCheck={false} />
        </div>

        {signMethod === 'privateKey' && (
          <div className="field-group">
            <label>Signer Private Key</label>
            <input
              type="text"
              className="private-key-input"
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="0x..."
              autoComplete="off"
              data-lpignore="true"
            />
          </div>
        )}

        {/* Button is persistent, text changes with state */}
        <button className="primary-action" onClick={handleSign} disabled={isSigning || !signMsg || (signMethod === 'privateKey' && !privateKey)}>
          {isSigning
            ? 'Calculating...'
            : hasResult
              ? 'RE-GENERATE SIGNATURE'
              : 'GENERATE SIGNATURE'
          }
        </button>

        {signError && (
          <div className="inline-error">
            <IconAlert />
            <span>{signError}</span>
          </div>
        )}

        <div className="divider">RESULTS</div>

        <div className="field-group">
          <label>Generated Signature</label>
          <input className="readonly" readOnly value={outSig} onClick={e => e.currentTarget.select()} />
        </div>

        <div className="field-group">
          <label>Signer Address</label>
          <input className="readonly" readOnly value={outAddr} onClick={e => e.currentTarget.select()} />
        </div>

        {hasResult && (
          <div className="bottom-action-area">
            <button className="transfer-rect-btn" onClick={fillVerifier}>
              Fill to Verifier &rarr;
            </button>
          </div>
        )}
      </div>


      {/* === Right Panel: Verifier === */}
      <div className="panel">
        <div className="panel-header">
          <h2>Verify Signature</h2>
        </div>

        <div className="field-group">
          <label>Expected Original Message</label>
          <textarea value={verifyMsg} onChange={e => setVerifyMsg(e.target.value)} placeholder="Content..." spellCheck={false} />
        </div>

        <div className="field-group">
          <label>Expected Signer Address</label>
          <input value={verifyAddr} onChange={e => setVerifyAddr(e.target.value)} placeholder="0x..." />
        </div>

        <div className="field-group">
          <label>Received Signature</label>
          <input value={verifySig} onChange={e => setVerifySig(e.target.value)} placeholder="0x..." />
        </div>

        <div className="bottom-action-area">
          {verifyResult === 'idle' ? (
            <button className="verify-btn" onClick={handleVerify} disabled={!verifyAddr || !verifyMsg || !verifySig}>
              VERIFY MATCH
            </button>
          ) : (
            <div className={`verify-result-bar ${verifyResult}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {verifyResult === 'match' && <><IconCheck /> <span>SIGNATURE MATCHED</span></>}
                {verifyResult === 'mismatch' && <><IconX /> <span>MISMATCH FAILED</span></>}
                {verifyResult === 'error' && <><IconAlert /> <span>FORMAT ERROR</span></>}
              </div>
              <button className="icon-btn" onClick={() => setVerifyResult('idle')}>
                <IconRefresh />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;