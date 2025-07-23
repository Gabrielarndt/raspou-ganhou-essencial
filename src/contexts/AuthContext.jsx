@@ .. @@
   useEffect(() => {
-    console.log('🚀 AuthContext: Initializing...');
     const loadUser = () => {
       try {
         const savedUser = localStorage.getItem('raspou_user');
-        console.log('📦 AuthContext: Loading user from localStorage:', !!savedUser);
         if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
-          console.log('✅ AuthContext: User loaded successfully:', parsedUser.email);
           setUser(parsedUser);
         } else {
-          console.log('❌ AuthContext: No user found in localStorage');
           setUser(null);
         }
       } catch (error) {
-        console.error('💥 AuthContext: Failed to parse user from localStorage', error);
+        console.error('Failed to parse user from localStorage', error);
         localStorage.removeItem('raspou_user');
         setUser(null);
       } finally {
-        console.log('🏁 AuthContext: Loading complete, setting loading to false');
         setLoading(false);
       }
     };
@@ .. @@
   // Verificar mudanças no localStorage
   useEffect(() => {
     const handleStorageChange = () => {
-      console.log('🔄 AuthContext: Storage changed, reloading user');
       const savedUser = localStorage.getItem('raspou_user');
       if (savedUser) {
         try {
@@ -89,7 +82,6 @@
   }, []);

   const login = (email, senha) => {
-    console.log('🔐 AuthContext: Attempting login for email:', email);
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     const foundUser = users.find(u => 
       u.email === email && (u.senha === senha || u.password === senha)
@@ -97,9 +89,6 @@
     
     if (foundUser) {
-      console.log('✅ AuthContext: User found, logging in:', foundUser.email);
       setUser(foundUser);
       localStorage.setItem('raspou_user', JSON.stringify(foundUser));
-      console.log('💾 AuthContext: User saved to localStorage');
       
       // Forçar re-renderização de todos os componentes
       triggerUpdate();
@@ -110,13 +99,10 @@
       return { success: true };
     }
     
-    console.log('❌ AuthContext: Login failed for email:', email);
     return { success: false, message: 'Email ou senha incorretos' };
   };

   const register = (userData) => {
-    console.log('📝 AuthContext: Attempting registration for user:', userData.email);
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     
     if (users.find(u => u.email === userData.email)) {
-      console.log('❌ AuthContext: Registration failed, email already exists:', userData.email);
       return { success: false, message: 'Email já cadastrado' };
     }
     
     if (users.find(u => u.cpf === userData.cpf)) {
-      console.log('❌ AuthContext: Registration failed, CPF already exists:', userData.cpf);
       return { success: false, message: 'CPF já cadastrado' };
     }

@@ .. @@
     users.push(newUser);
     localStorage.setItem('raspou_users', JSON.stringify(users));
-    console.log('✅ AuthContext: User registered and saved:', newUser.email);
     
     return { success: true };
   };

   const logout = () => {
-    console.log('🚪 AuthContext: Logging out user:', user?.email);
     setUser(null);
     localStorage.removeItem('raspou_user');
-    console.log('🧹 AuthContext: User removed from localStorage');
     
     // Forçar re-renderização
     triggerUpdate();
@@ -154,7 +137,6 @@
   };

   const updateUser = (updatedData) => {
-    console.log('🔄 AuthContext: Attempting to update user:', user?.email);
     const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
     const userIndex = users.findIndex(u => u.id === user.id);
     
@@ -165,13 +147,10 @@
       localStorage.setItem('raspou_users', JSON.stringify(users));
       setUser(updatedUser);
       localStorage.setItem('raspou_user', JSON.stringify(updatedUser));
-      console.log('✅ AuthContext: User updated and saved:', updatedUser.email);
       
       // Forçar re-renderização
       triggerUpdate();
       
       return { success: true };
     }
     
-    console.log('❌ AuthContext: Failed to update user:', user?.email);
     return { success: false, message: 'Erro ao atualizar usuário' };
   };