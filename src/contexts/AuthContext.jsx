@@ .. @@
  const login = (email, senha) => {
    console.log('🔐 AuthContext: Attempting login for email:', email);
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    
    // Filtrar apenas usuários reais (não admins)
    const realUsers = users.filter(u => 
      !u.is_admin && 
      !u.is_super_admin && 
      !u.is_affiliate &&
      u.email !== 'admin@raspouganhou.com' &&
      u.email !== 'superadmin@raspouganhou.com'
    );
    
    const foundUser = realUsers.find(u => 
      u.email === email && (u.senha === senha || u.password === senha)
    );
    
    if (foundUser) {
      console.log('✅ AuthContext: User found, logging in:', foundUser.email);
      setUser(foundUser);
      localStorage.setItem('raspou_user', JSON.stringify(foundUser));
      console.log('💾 AuthContext: User saved to localStorage');
      
      // Forçar re-renderização de todos os componentes
      triggerUpdate();
      
      // Disparar evento customizado para notificar mudança
      window.dispatchEvent(new CustomEvent('userLogin', { detail: foundUser }));
      
      return { success: true };
    }
    
    console.log('❌ AuthContext: Login failed for email:', email);
    return { success: false, message: 'Email ou senha incorretos' };
  };