"use client"

import type React from "react"
import { useState, useEffect, useMemo, createContext, useContext } from "react"
import styled from "styled-components"

// ============================================================================
// CONTEXTO DE AUTENTICAÇÃO
// ============================================================================

// Interface para definir o tipo do usuário
interface User {
  id: string
  name: string
  email: string
  phone: string
  birthDate: string
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (userData: Omit<User, "id"> & { password: string }) => boolean
  logout: () => void
  isAuthenticated: boolean
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar o contexto de autenticação
const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// ============================================================================
// STYLED COMPONENTS - ESTILIZAÇÃO COM TEMA DO VASCO
// ============================================================================

// Container principal da aplicação
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  font-family: 'Arial', sans-serif;
  color: white;
`

// Header com logo e navegação
const Header = styled.header`
  background: linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  
  h1 {
    margin: 0;
    font-size: clamp(1.2rem, 4vw, 2rem);
    font-weight: bold;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`

// Logo do Vasco no header
const VascoLogo = styled.img`
  width: clamp(40px, 8vw, 60px);
  height: clamp(40px, 8vw, 60px);
  object-fit: contain;
`

// Container para centralizar conteúdo
const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`

// Formulário estilizado
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

// Input estilizado com tema do Vasco
const Input = styled.input`
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffffff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 16px; /* Evita zoom no iOS */
  }
`

// Botão principal com cores do Vasco (preto e branco)
const Button = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ffffff, #e0e0e0);
  color: #000000;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  
  &:hover {
    background: linear-gradient(45deg, #e0e0e0, #cccccc);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
`

// Botão secundário
const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid #ffffff;
  color: #ffffff;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`

// Mensagem de erro
const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 0.8rem;
  border-radius: 5px;
  border-left: 4px solid #ff6b6b;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`

// Mensagem de sucesso
const SuccessMessage = styled.div`
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  padding: 0.8rem;
  border-radius: 5px;
  border-left: 4px solid #51cf66;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`

// Card de perfil
const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  
  h3 {
    color: #ffffff;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }
  
  strong {
    color: #cccccc;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    h3 {
      font-size: 1.3rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`

// ============================================================================
// COMPONENTE DE NAVEGAÇÃO
// ============================================================================

interface NavigationProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  isAuthenticated: boolean
  logout: () => void
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, isAuthenticated, logout }) => {
  // Estilização da navegação
  const NavContainer = styled.nav`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
    flex-wrap: wrap;
    padding: 0 1rem;
  `

  const NavButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== "active",
  })<{ active: boolean }>`
    padding: 0.8rem 1.5rem;
    background: ${(props) => (props.active ? "#ffffff" : "transparent")};
    color: ${(props) => (props.active ? "#000000" : "#ffffff")};
    border: 2px solid #ffffff;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
    font-size: 0.9rem;
    
    &:hover {
      background: #ffffff;
      color: #000000;
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }
  `

  return (
    <NavContainer>
      {isAuthenticated ? (
        <>
          <NavButton active={currentPage === "home"} onClick={() => setCurrentPage("home")}>
            🏠 Início
          </NavButton>
          <NavButton active={currentPage === "profile"} onClick={() => setCurrentPage("profile")}>
            👤 Perfil
          </NavButton>
          <NavButton active={false} onClick={logout}>
            🚪 Sair
          </NavButton>
        </>
      ) : (
        <>
          <NavButton active={currentPage === "login"} onClick={() => setCurrentPage("login")}>
            🔑 Login
          </NavButton>
          <NavButton active={currentPage === "register"} onClick={() => setCurrentPage("register")}>
            📝 Cadastro
          </NavButton>
        </>
      )}
    </NavContainer>
  )
}

// ============================================================================
// PÁGINA DE LOGIN
// ============================================================================

const LoginPage: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  // Estados para controlar os campos do formulário
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Hook para acessar funções de autenticação
  const { login } = useAuth()

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulação de delay de rede
    setTimeout(() => {
      // Validação básica dos campos
      if (!email || !password) {
        setError("Por favor, preencha todos os campos!")
        setIsLoading(false)
        return
      }

      // Tentativa de login
      const success = login(email, password)

      if (!success) {
        setError("Email ou senha incorretos!")
      }

      setIsLoading(false)
    }, 1000)
  }

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <img src="/images/escudo-vasco.png" alt="Escudo do Vasco da Gama" style={{ width: "60px", height: "60px" }} />
        <h2 style={{ color: "#ffffff", margin: 0, textAlign: "center" }}>Login do Torcedor Vascaíno</h2>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="📧 Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <Input
          type="password"
          placeholder="🔒 Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "⏳ Entrando..." : "🚀 Entrar no Gigante da Colina"}
        </Button>
      </Form>

      <p style={{ textAlign: "center", marginTop: "1rem", color: "#ccc" }}>
        Ainda não é sócio-torcedor?{" "}
        <span
          style={{
            color: "#ffffff",
            cursor: "pointer",
            marginLeft: "5px",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
          onClick={() => setCurrentPage("register")}
        >
          Cadastre-se agora!
        </span>
      </p>
    </Container>
  )
}

// ============================================================================
// PÁGINA DE CADASTRO
// ============================================================================

const RegisterPage: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  // Estados para todos os campos do formulário de cadastro
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Hook para acessar função de registro
  const { register } = useAuth()

  // Função para validar nome completo
  const validateFullName = (name: string): boolean => {
    const trimmedName = name.trim()
    const words = trimmedName.split(/\s+/)
    return words.length >= 2 && words.every((word) => word.length > 0)
  }

  // Função para validar data de nascimento
  const validateBirthDate = (dateString: string): boolean => {
    if (!dateString) return false

    const date = new Date(dateString)
    const today = new Date()
    const currentYear = today.getFullYear()

    // Verificar se a data é válida
    if (isNaN(date.getTime())) return false

    const year = date.getFullYear()
    const age = currentYear - year

    // Verificar se o ano está dentro de um range razoável (1900 a ano atual)
    if (year < 1900 || year > currentYear) return false

    // Verificar se a pessoa tem pelo menos 10 anos e no máximo 120 anos
    if (age < 10 || age > 120) return false

    // Verificar se a data não é no futuro
    if (date > today) return false

    return true
  }

  // Função para validar telefone (apenas números, parênteses, espaços e hífens)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s$$$$\-+]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
  }

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Função para atualizar os campos do formulário com validações
  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // Validações específicas por campo
    if (field === "name") {
      // Permitir apenas letras, espaços e acentos
      processedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    } else if (field === "phone") {
      // Permitir apenas números, parênteses, espaços e hífens
      processedValue = value.replace(/[^\d\s$$$$\-+]/g, "")
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }))
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Simulação de delay de rede
    setTimeout(() => {
      // Validações do formulário
      if (!formData.name || !formData.email || !formData.phone || !formData.birthDate || !formData.password) {
        setError("Por favor, preencha todos os campos obrigatórios!")
        setIsLoading(false)
        return
      }

      if (!validateFullName(formData.name)) {
        setError("Por favor, insira seu nome completo (nome e sobrenome)!")
        setIsLoading(false)
        return
      }

      if (!validateEmail(formData.email)) {
        setError("Por favor, insira um email válido!")
        setIsLoading(false)
        return
      }

      if (!validatePhone(formData.phone)) {
        setError("Por favor, insira um telefone válido com pelo menos 10 dígitos!")
        setIsLoading(false)
        return
      }

      if (!validateBirthDate(formData.birthDate)) {
        setError("Por favor, insira uma data de nascimento válida! Você deve ter entre 10 e 120 anos.")
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem!")
        setIsLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres!")
        setIsLoading(false)
        return
      }

      // Tentativa de registro
      const success = register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        password: formData.password,
      })

      if (success) {
        setSuccess("Cadastro realizado com sucesso! Bem-vindo ao Vasco!")
        // Limpar formulário
        setFormData({
          name: "",
          email: "",
          phone: "",
          birthDate: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        setError("Este email já está cadastrado!")
      }

      setIsLoading(false)
    }, 1500)
  }

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <img
          src="/images/escudo-historico.png"
          alt="Escudo Histórico do Vasco"
          style={{ width: "60px", height: "60px" }}
        />
        <h2 style={{ color: "#ffffff", margin: 0, textAlign: "center" }}>Cadastro de Torcedor</h2>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="👤 Nome completo (ex: João Silva) *"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          disabled={isLoading}
        />

        <Input
          type="email"
          placeholder="📧 Email *"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          disabled={isLoading}
        />

        <Input
          type="tel"
          placeholder="📱 Telefone (ex: (21) 99999-9999) *"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          disabled={isLoading}
        />

        <Input
          type="date"
          placeholder="🎂 Data de nascimento *"
          value={formData.birthDate}
          onChange={(e) => handleInputChange("birthDate", e.target.value)}
          disabled={isLoading}
          min="1900-01-01"
          max={new Date().toISOString().split("T")[0]}
        />

        <Input
          type="password"
          placeholder="🔒 Senha (mín. 6 caracteres) *"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          disabled={isLoading}
        />

        <Input
          type="password"
          placeholder="🔒 Confirmar senha *"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          disabled={isLoading}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "⏳ Cadastrando..." : "🎯 Virar Sócio-Torcedor"}
        </Button>
      </Form>

      <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem", color: "#ccc" }}>* Campos obrigatórios</p>

      <p style={{ textAlign: "center", marginTop: "1rem", color: "#ccc" }}>
        Já tem conta?{" "}
        <span
          style={{
            color: "#ffffff",
            cursor: "pointer",
            marginLeft: "5px",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
          onClick={() => setCurrentPage("login")}
        >
          Faça login aqui!
        </span>
      </p>
    </Container>
  )
}

// ============================================================================
// PÁGINA INICIAL (HOME)
// ============================================================================

const HomePage: React.FC = () => {
  const { user } = useAuth()

  // Estado para controlar mensagens motivacionais
  const [currentMessage, setCurrentMessage] = useState(0)

  // Array de mensagens motivacionais do Vasco
  const messages = useMemo(
    () => [
      "Bem-vindo ao Gigante da Colina!",
      "Vasco da Gama - Tradição e Glória desde 1898! 🏆",
      "Aqui é Vasco! O clube do povo! 💪",
      "São Januário te espera! 🏟️",
      "Força Vasco! Rumo à vitória! ⚽",
    ],
    [],
  )

  // useEffect para trocar mensagens automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [messages.length])

  // Função para calcular idade
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  return (
    <Container>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#ffffff", fontSize: "clamp(1.5rem, 5vw, 2.5rem)", marginBottom: "1rem" }}>
          {messages[currentMessage]}
        </h1>

        <h2 style={{ color: "white", marginBottom: "2rem", fontSize: "clamp(1.2rem, 4vw, 1.8rem)" }}>
          Olá, <span style={{ color: "#cccccc" }}>{user?.name}</span>! 👋
        </h2>
      </div>

      <ProfileCard>
        <h3>🏆 Seus Dados de Torcedor</h3>
        <p>
          <strong>Nome:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Idade:</strong> {calculateAge(user?.birthDate || "")} anos
        </p>
        <p>
          <strong>Telefone:</strong> {user?.phone}
        </p>
      </ProfileCard>

      {/* Imagem do São Januário */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img
          src="/images/sao-januario.jpg"
          alt="Estádio São Januário"
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "10px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
        />
        <p style={{ color: "#cccccc", marginTop: "0.5rem", fontStyle: "italic", fontSize: "0.9rem" }}>
          🏟️ Estádio São Januário - A casa do Gigante da Colina
        </p>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          padding: "2rem",
          borderRadius: "10px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "#ffffff", marginBottom: "1rem" }}>🎯 Próximos Jogos do Vasco</h3>
        <div style={{ textAlign: "left", maxHeight: "300px", overflowY: "auto", fontSize: "0.9rem" }}>
          <h4 style={{ color: "#cccccc", marginBottom: "0.5rem" }}>📅 Abril 2025</h4>
          <p>⚽ 27/04 - 18:30 - Cruzeiro x Vasco (Brasileirão)</p>

          <h4 style={{ color: "#cccccc", marginBottom: "0.5rem", marginTop: "1rem" }}>📅 Maio 2025</h4>
          <p>⚽ 01/05 - 16:00 - Operário-PR x Vasco (Copa do Brasil)</p>
          <p>⚽ 04/05 - 16:00 - Vasco x Palmeiras (Brasileirão)</p>
          <p>⚽ 07/05 - 19:00 - Puerto Cabello x Vasco (Sul-Americana)</p>
          <p>⚽ 10/05 - 18:30 - Vitória x Vasco (Brasileirão)</p>
          <p>⚽ 13/05 - 21:30 - Lanús x Vasco (Sul-Americana)</p>
          <p>⚽ 17/05 - 18:30 - Vasco x Fortaleza (Brasileirão)</p>
          <p>⚽ 20/05 - 19:00 - Vasco x Operário-PR (Copa do Brasil)</p>
          <p>⚽ 24/05 - 18:30 - Fluminense x Vasco (Brasileirão)</p>
          <p>⚽ 27/05 - 19:00 - Vasco x Melgar (Sul-Americana)</p>
          <p>⚽ 31/05 - 21:00 - Vasco x Bragantino (Brasileirão)</p>

          <h4 style={{ color: "#cccccc", marginBottom: "0.5rem", marginTop: "1rem" }}>📅 Junho 2025</h4>
          <p>⚽ 12/06 - 21:30 - São Paulo x Vasco (Brasileirão)</p>

          <h4 style={{ color: "#cccccc", marginBottom: "0.5rem", marginTop: "1rem" }}>📅 Julho 2025</h4>
          <p>⚽ 13/07 - Vasco x Botafogo (Brasileirão)</p>
          <p>⚽ 16/07 - Juventude x Vasco (Brasileirão)</p>
          <p>⚽ 20/07 - Vasco x Grêmio (Brasileirão)</p>
          <p>⚽ 23/07 - Vasco x Bahia (Brasileirão)</p>
          <p>⚽ 27/07 - Internacional x Vasco (Brasileirão)</p>

          <h4 style={{ color: "#cccccc", marginBottom: "0.5rem", marginTop: "1rem" }}>📅 Agosto 2025</h4>
          <p>⚽ 03/08 - Mirassol x Vasco (Brasileirão)</p>
          <p>⚽ 10/08 - Vasco x Atlético-MG (Brasileirão)</p>
          <p>⚽ 17/08 - Santos x Vasco (Brasileirão)</p>
          <p>⚽ 24/08 - Vasco x Corinthians (Brasileirão)</p>
          <p>⚽ 31/08 - Sport x Vasco (Brasileirão)</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.3)",
          padding: "1.5rem",
          borderRadius: "10px",
        }}
      >
        <h4 style={{ color: "#ffffff" }}>🏟️ Hino do Vasco</h4>
        <p style={{ fontStyle: "italic", color: "#ccc", fontSize: "0.9rem", lineHeight: "1.6" }}>
          "Vamos todos cantar de coração
          <br />A cruz de malta é o meu pendão
          <br />
          Tu tens um nome do heróico Português
          <br />
          Vasco da Gama, a tua fama assim se fez
          <br />
          Tua imensa torcida é bem feliz
          <br />
          Norte-Sul, norte-sul deste Brasil
          <br />
          Tua estrela, na Terra a brilhar
          <br />
          Ilumina o mar
          <br />
          No atletismo és um braço
          <br />
          No remo és imortal
          <br />
          No futebol és o traço
          <br />
          De união Brasil-Portugal"
        </p>
      </div>
    </Container>
  )
}

// ============================================================================
// PÁGINA DE PERFIL
// ============================================================================

const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  // Estado para controlar edição do perfil
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  })

  // Função para salvar alterações (simulada)
  const handleSave = () => {
    console.log("Dados salvos:", editData)
    setIsEditing(false)
    alert("Perfil atualizado com sucesso! ✅")
  }

  // Função para calcular tempo como torcedor (simulado)
  const getMembershipTime = () => {
    const today = new Date()
    const memberSince = new Date("2024-01-01")
    const diffTime = Math.abs(today.getTime() - memberSince.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Container>
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#ffffff" }}>👤 Perfil do Torcedor</h2>

      <ProfileCard>
        <h3>📋 Informações Pessoais</h3>

        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
            />
            <Input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Telefone"
            />
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Button onClick={handleSave}>💾 Salvar</Button>
              <SecondaryButton onClick={() => setIsEditing(false)}>❌ Cancelar</SecondaryButton>
            </div>
          </div>
        ) : (
          <>
            <p>
              <strong>Nome:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Telefone:</strong> {user?.phone}
            </p>
            <p>
              <strong>Data de Nascimento:</strong> {new Date(user?.birthDate || "").toLocaleDateString("pt-BR")}
            </p>

            <Button onClick={() => setIsEditing(true)} style={{ marginTop: "1rem" }}>
              ✏️ Editar Perfil
            </Button>
          </>
        )}
      </ProfileCard>

      <ProfileCard>
        <h3>🏆 Status de Torcedor</h3>
        <p>
          <strong>Membro há:</strong> {getMembershipTime()} dias
        </p>
        <p>
          <strong>Categoria:</strong> Sócio-Torcedor Ativo
        </p>
        <p>
          <strong>Pontos de Fidelidade:</strong> 1.250 pontos
        </p>
        <p>
          <strong>Jogos Assistidos:</strong> 15 jogos
        </p>
      </ProfileCard>

      <div
        style={{
          background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.2))",
          padding: "2rem",
          borderRadius: "10px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "#ffffff" }}>🎖️ Conquistas</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <div>🏆 Torcedor Fiel</div>
          <div>⚽ Presença VIP</div>
          <div>🎯 Apoiador Oficial</div>
          <div>🔥 Gigante da Colina</div>
        </div>
      </div>
    </Container>
  )
}

// ============================================================================
// PROVIDER DE AUTENTICAÇÃO
// ============================================================================

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para armazenar usuário logado
  const [user, setUser] = useState<User | null>(null)

  // Estado para armazenar usuários cadastrados (simulando banco de dados)
  const [users, setUsers] = useState<(User & { password: string })[]>([
    // Usuário de exemplo para teste
    {
      id: "1",
      name: "João Vascaíno Silva",
      email: "joao@vasco.com",
      phone: "(21) 99999-9999",
      birthDate: "1990-01-01",
      password: "123456",
    },
  ])

  // useEffect para verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("vascoUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Função de login
  const login = (email: string, password: string): boolean => {
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("vascoUser", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  // Função de registro
  const register = (userData: Omit<User, "id"> & { password: string }): boolean => {
    // Verificar se email já existe
    if (users.some((u) => u.email === userData.email)) {
      return false
    }

    // Criar novo usuário
    const newUser = {
      ...userData,
      id: Date.now().toString(),
    }

    // Adicionar à lista de usuários
    setUsers((prev) => [...prev, newUser])

    // Fazer login automático após cadastro
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("vascoUser", JSON.stringify(userWithoutPassword))

    return true
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("vascoUser")
  }

  // Valor do contexto
  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ============================================================================

const App: React.FC = () => {
  // Estado para controlar qual página está sendo exibida
  const [currentPage, setCurrentPage] = useState("login")

  // Hook para acessar dados de autenticação
  const { isAuthenticated, logout } = useAuth()

  // useEffect para redirecionar após login/logout
  useEffect(() => {
    if (isAuthenticated && (currentPage === "login" || currentPage === "register")) {
      setCurrentPage("home")
    } else if (!isAuthenticated && (currentPage === "home" || currentPage === "profile")) {
      setCurrentPage("login")
    }
  }, [isAuthenticated, currentPage])

  // Função para renderizar a página atual
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage setCurrentPage={setCurrentPage} />
      case "register":
        return <RegisterPage setCurrentPage={setCurrentPage} />
      case "home":
        return <HomePage />
      case "profile":
        return <ProfilePage />
      default:
        return <LoginPage setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <AppContainer>
      <Header>
        <VascoLogo src="/images/escudo-vasco.png" alt="Escudo do Vasco" />
        <h1>CLUBE DE REGATAS VASCO DA GAMA</h1>
        <VascoLogo src="/images/escudo-vasco.png" alt="Escudo do Vasco" />
      </Header>

      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {renderCurrentPage()}

      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          color: "#666",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          marginTop: "3rem",
          fontSize: "0.9rem",
        }}
      >
        <p>© 2025 Clube de Regatas Vasco da Gama - Gigante da Colina</p>
        <p>
          <strong>Feito por Eduardo Lima</strong> | Site fictício para fins acadêmicos
        </p>
      </footer>
    </AppContainer>
  )
}

// ============================================================================
// COMPONENTE RAIZ COM PROVIDER - EXPORTAÇÃO PADRÃO
// ============================================================================

export default function VascoApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
