create database EXPENDITURE_MANAGER
go
use EXPENDITURE_MANAGER
go
create table usuarios (
	id int identity(1,1) ,
	email varchar(50) unique not null,
	pw varchar(600) not null
	constraint pk_usuarios primary key (id)
)
go
create table categorias (
	id int identity(1,1) ,
	descripcion varchar(50) ,
	idUsuario int not null,
	estado bit not null
	constraint pk_categorias primary key (id) ,
	constraint fk_categorias_usuarios foreign key (idUsuario) references usuarios (id)
)
go
create table operaciones (
	id int identity(1,1) ,
	concepto varchar(50) not null,
	monto real not null ,
	fecha date not null ,
	tipo bit not null, 
	idUsuario int not null,
	idCategoria int not null ,
	estado bit not null
	constraint pk_operaciones primary key (id) ,
	constraint fk_operaciones_usuarios foreign key (idUsuario) references usuarios (id) ,
	constraint fk_operaciones_categorias foreign key (idCategoria) references categorias (id)
)
go
create procedure pa_insertUsuario
	@emailUsuario varchar(50) ,
	@pwUsuario varchar(600)
	as
	begin
		insert into usuarios (email , pw ) values(@emailUsuario , @pwUsuario)
	end
go
create procedure pa_login
	@emailUsuario varchar(50) 
	as
	begin
		select top 1 id as idUsuario , email as emailUsuario , pw as pwUsuario from usuarios where email = @emailUsuario
	end
go
create procedure pa_listaCategorias
	@idUsuario int
	as
	begin
		select c.id as idCategoria , c.descripcion as descripcionCategorias 
		from categorias c
		where c.estado = 1 and c.idUsuario = @idUsuario
	end
go
create procedure pa_guardarCategoria
	@descripcionCategoria varchar(50) ,
	@idUsuario int
	as
	begin
		insert into categorias (descripcion , idUsuario , estado ) values (@descripcionCategoria , @idUsuario, 1)
	end
go
create procedure pa_actualizarCategoria
	@idCategoria int ,
	@descripcionCategoria varchar(50)
	as
	begin
		update categorias
		set
		descripcion = @descripcionCategoria
		where id = @idCategoria
	end
go
create procedure pa_eliminaCategoria
	@idCategoria int 
	as
	begin
		update categorias
		set
		estado = 0
		where id = @idCategoria
	end
go
create procedure pa_listaOperaciones
	@idUsuario int
	as
	begin
		select o.id as idOperacion , o.concepto as conceptoOperacion , o.monto as montoOperacion , o.fecha as fechaOperacion , tipo as tipoOperacion , c.id as idCategoria , c.descripcion as descripcionCategoria
		from operaciones o
		join categorias c on o.idCategoria = c.id
		where o.estado = 1 and o.idUsuario = @idUsuario
		order by o.fecha desc
	end
go
create procedure pa_guardarOperacion
	@conceptoOperacion varchar(50) ,
	@montoOperacion real ,
	@fechaOperacion date ,
	@tipoOperacion bit ,
	@idUsuario int ,
	@idCategoria int
	as
	begin
		insert into operaciones (concepto , monto , fecha , tipo , idUsuario , idCategoria , estado ) 
		values (@conceptoOperacion , @montoOperacion , @fechaOperacion , @tipoOperacion , @idUsuario , @idCategoria , 1)
	end
go
create procedure pa_actualizarOperacion
	@idOperacion int ,
	@conceptoOperacion varchar(50) ,
	@montoOperacion real ,
	@fechaOperacion date ,
	@idCategoria int
	as
	begin
		update operaciones
		set
		concepto= @conceptoOperacion ,
		monto = @montoOperacion ,
		fecha = @fechaOperacion  ,
		idCategoria =@idCategoria 
		where id = @idOperacion
	end
go
create procedure pa_eliminaOperacion
	@idOperacion int 
	as
	begin
		update operaciones
		set
		estado = 0
		where id = @idOperacion
	end

select * from operaciones












