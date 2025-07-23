@@ .. @@
   useEffect(() => {
     const loadUser = () => {
       try {
         const savedUser = localStorage.getItem('raspou_user');
         if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           setUser(parsedUser);
         } else {
           setUser(null);
         }
       } catch (error) {
         console.error('Failed to parse user from localStorage', error);
         localStorage.removeItem('raspou_user');
         setUser(null);
       } finally {
         setLoading(false);
       }
     };

     loadUser();
   }, []);

   // Verificar mudanças no localStorage
   useEffect(() => {
     const handleStorageChange = () => {
       const savedUser = localStorage.getItem('raspou_user');
       if (savedUser) {
         try {
           const parsedUser = JSON.parse(savedUser);
           setUser(parsedUser);
         } catch (error) {
           console.error('Failed to parse user from localStorage', error);
           localStorage.removeItem('raspou_user');
           setUser(null);
         }
       } else {
         setUser(null);
       }
     };

     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);
   }, []);

   const login = (email, senha) => {
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     const foundUser = users.find(u => 
       u.email === email && (u.senha === senha || u.password === senha)
     );
     
     if (foundUser) {
       setUser(foundUser);
       localStorage.setItem('raspou_user', JSON.stringify(foundUser));
       
       // Forçar re-renderização de todos os componentes
       triggerUpdate();
       
       // Disparar evento customizado
       window.dispatchEvent(new Event('userLogin'));
       
       return { success: true };
     }
     
     return { success: false, message: 'Email ou senha incorretos' };
   };

   const register = (userData) => {
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     
     if (users.find(u => u.email === userData.email)) {
       return { success: false, message: 'Email já cadastrado' };
     }
     
     if (users.find(u => u.cpf === userData.cpf)) {
       return { success: false, message: 'CPF já cadastrado' };
     }

     const newUser = {
       id: Date.now().toString(),
       ...userData,
       createdAt: new Date().toISOString()
     };
     
     users.push(newUser);
     localStorage.setItem('raspou_users', JSON.stringify(users));
     
     return { success: true };
   };

   const logout = () => {
     setUser(null);
     localStorage.removeItem('raspou_user');
     
     // Forçar re-renderização
     triggerUpdate();
     
     // Disparar evento customizado
     window.dispatchEvent(new Event('userLogout'));
   };

   const updateUser = (updatedData) => {
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     const userIndex = users.findIndex(u => u.id === user.id);
     
     if (userIndex !== -1) {
       const updatedUser = { ...users[userIndex], ...updatedData };
       users[userIndex] = updatedUser;
       
       localStorage.setItem('raspou_users', JSON.stringify(users));
       setUser(updatedUser);
       localStorage.setItem('raspou_user', JSON.stringify(updatedUser));
       
       // Forçar re-renderização
       triggerUpdate();
       
       return { success: true };
     }
     
     return { success: false, message: 'Erro ao atualizar usuário' };
   };