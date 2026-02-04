# Arquivo 3 — Front-end React — Tecnologias, Requisitos e Instruções
> Nome sugerido do arquivo: `03-frontend.md`

## 1) Objetivo do front-end
Construir uma interface em **React.js** para:
- conectar carteira (RainbowKit);
- exibir saldo de ERC-20 do usuário;
- permitir ao admin (owner) distribuir tokens (mint + transfer no ERC-20);
- permitir ao admin atualizar preço do NFT (setPrice no ERC-721);
- permitir a qualquer usuário comprar NFT via fluxo:
  1) ler `price()` do ERC-721
  2) chamar `approve(erc721Address, price)` no ERC-20
  3) chamar `mint()` no ERC-721
- listar NFTs do usuário conectado e permitir transferência do NFT.

## 2) Tecnologias obrigatórias (do material)
- **React.js**
- **ethers.js**
- **wagmi**
- **RainbowKit** (conexão de carteira)
- **Redux** (estado global)
- **Sweetalert** (alertas)
- **Tailwind CSS**
- **DaisyUI**

> Observação: a conexão e o padrão de hooks (provider/signer) devem seguir a abordagem descrita no material (provider para leitura e signer para escrita). :contentReference[oaicite:1]{index=1}

## 3) Estrutura de interface (árvore mínima exigida)
### Header
- Botão de conexão via RainbowKit.
- Após conectar, exibir **saldo do ERC-20** no cabeçalho.

### Seção Administração
- **Cunhar e transferir tokens**: chamar função `mintAndTransfer(to, amount)` do ERC-20.
  - Atenção: `amount` deve considerar 18 decimais (converter com `parseUnits`).
- **Atualizar preço**: chamar `setPrice(newPrice)` do ERC-721.
  - Atenção: `newPrice` deve considerar 18 decimais.
- **Consultar preço**: ler `price()` (variável pública) do ERC-721 e exibir em formato humano.

### Seção Usuários
- **Comprar NFT**:
  1) front consulta `price()` do ERC-721
  2) solicita approve no ERC-20 (`approve(erc721Address, price)`)
  3) chama `mint()` no ERC-721
- **Tokens / NFTs**
  - Listar NFTs do usuário (carteira conectada).
  - Permitir **transferir NFT** para outra carteira.

## 4) Configuração de ambiente (.env)
Criar `.env` baseado em `.env.example` e incluir os endereços dos contratos:

Exemplo `.env.example`:
- `ERC20_ADDRESS=`
- `ERC721_ADDRESS=`

> O material demonstra o uso de `.env` para endereços de contrato e execução local com `npm i` + `npm run start`. :contentReference[oaicite:2]{index=2}

## 5) Dados e ABIs
- O front deve possuir as ABIs dos contratos:
  - Opção recomendada: exportar ABI pelo Hardhat e copiar para `src/abi/PaymentToken.json` e `src/abi/PaidMintNFT.json`.
- O front deve apontar para os endereços via `.env`.

## 6) Padrão de integração (provider vs signer)
- Para funções **view** (`balanceOf`, `price`, `tokenURI`), usar **provider**.
- Para funções que mudam estado (`approve`, `mint`, `mintAndTransfer`, `setPrice`, `transferFrom` do ERC-721), usar **signer**.

## 7) Fluxos detalhados (passo a passo)
### 7.1) Conectar carteira
- Exibir `<ConnectButton />` no header via RainbowKit.
- Ao conectar:
  - obter `address` atual;
  - carregar saldo ERC-20 (chamando `balanceOf(address)`).

### 7.2) Admin — mint e transfer (ERC-20)
- Inputs:
  - `to` (address)
  - `amount` (string decimal: ex. `"100"`)
- Conversão:
  - `amountWei = parseUnits(amount, 18)`
- Chamada:
  - `erc20.mintAndTransfer(to, amountWei)`
- Exibir sucesso/erro com Sweetalert.

> Observação: é responsabilidade do contrato restringir por `onlyOwner`. O front pode apenas esconder a seção se o usuário não for owner (lendo `owner()`), mas não substitui a regra on-chain.

### 7.3) Admin — atualizar preço (ERC-721)
- Input:
  - `newPrice` (string decimal)
- Converter:
  - `newPriceWei = parseUnits(newPrice, 18)`
- Chamar:
  - `erc721.setPrice(newPriceWei)`

### 7.4) Usuário — comprar NFT (approve + mint)
- Passo 1: ler preço
  - `priceWei = erc721.price()`
- Passo 2: approve
  - `erc20.approve(ERC721_ADDRESS, priceWei)`
  - aguardar confirmação
- Passo 3: mint
  - `erc721.mint()`
  - aguardar confirmação
- Pós-compra:
  - recarregar saldo ERC-20
  - recarregar lista de NFTs do usuário
  - alertar com Sweetalert

## 8) Listagem de NFTs do usuário
Como o ERC-721 não fornece enumeração por padrão:
- Recomendação A (mais simples para o exercício): o contrato ERC-721 deve expor:
  - evento `Transfer` (já existe) e o front pode consultar logs para o endereço e construir a lista.
- Recomendação B (se optar por ERC721Enumerable): usar `tokenOfOwnerByIndex`.
- Recomendação C (híbrida): manter no contrato um mapping `owner => tokenIds[]` (mais trabalho, mas direto).

Para facilitar o desenvolvimento do front e evitar indexação complexa, recomenda-se **ERC721Enumerable** se isso não conflitar com os requisitos.

## 9) Transferência de NFT
- Inputs:
  - `to` (address)
  - `tokenId`
- Chamar:
  - `erc721["safeTransferFrom(address,address,uint256)"](userAddress, to, tokenId)`
- Atualizar lista após confirmação.

## 10) Estrutura recomendada do projeto React
- `src/`
  - `abi/`
    - `PaymentToken.json`
    - `PaidMintNFT.json`
  - `components/`
    - `Header.jsx`
    - `AdminPanel.jsx`
    - `UserPanel.jsx`
    - `NftList.jsx`
  - `store/` (Redux)
    - `index.js`
    - `walletSlice.js`
    - `balancesSlice.js`
    - `nftsSlice.js`
  - `utils/`
    - `contracts.js` (helpers ethers: getContractWithProvider/getContractWithSigner)
    - `format.js` (formatUnits/parseUnits)
  - `App.jsx`

## 11) Requisitos de UX (mínimos)
- Alertas padronizados com Sweetalert:
  - “assinatura solicitada”
  - “transação enviada”
  - “confirmada” / “falhou”
- Estados de loading por ação (approve, mint, setPrice, mintAndTransfer).
- Exibir rede atual e solicitar troca de rede via RainbowKit (comportamento padrão).

## 12) Definição de pronto (DoD)
- Conecta carteira via RainbowKit.
- Exibe saldo ERC-20 do usuário conectado.
- Admin consegue mint+transfer (se for owner).
- Admin consegue atualizar e consultar preço.
- Usuário consegue comprar NFT via approve + mint.
- Lista NFTs do usuário e permite transferência.
- Endereços vêm do `.env`.
- Sem hardcode de chaves privadas no front.
