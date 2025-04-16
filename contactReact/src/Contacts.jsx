import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input } from "antd";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); //Храним состояние открытия моадльного окна
  const [form] = Form.useForm(); // Для упралвения ввода данными внутри модального окна
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  }); //Добавил отдельную серверную пагинацию

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchPagination = async (page = 1, size = 10) => {
    try {
      const res = await fetch(
        `http://localhost:5163/api/Contact/paged/${page}/${size}`
      );
      const data = await res.json();
      setContacts(data.data);
      setPagination({ current: page, pageSize: size, total: data.total });
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5163/api/Contact/GetAll");
      if (!res.ok) {
        throw new Error(`Ошибка HTTP! Статус: ${res.status}`);
      }
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error("Ошибка загрузки контактов:", error);
      // Здесь можно добавить уведомление для пользователя, например, через antd message
    }
  };

  const addOrUpdateContact = async (contact) => {
    try {
      const res = await fetch("http://localhost:5163/api/Contact/AddOrUpdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      });
      if (!res.ok) {
        throw new Error(`Ошибка HTTP! Статус: ${res.status}`);
      }
      fetchContacts();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Ошибка при добавлении/обновлении контакта:", error);
    }
  };

  const deleteContact = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5163/api/Contact/Delete/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      if (!res.ok) {
        throw new Error(`Ошибка HTTP! Статус: ${res.status}`);
      }
      fetchContacts();
    } catch (error) {
      console.error("Ошибка при удалении контакта:", error);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "First Name", dataIndex: "first_name", key: "first_name" },
    { title: "Last Name", dataIndex: "last_name", key: "last_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "number", key: "number" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button danger onClick={() => deleteContact(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          setIsModalOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Contact
      </Button>
      <h1>Пагинация серверная</h1>
      <Table
        dataSource={contacts}
        columns={columns}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchPagination(page, pageSize),
        }}
      />
      {/* 
      <Table
        dataSource={contacts}
        columns={columns}   обычный getAll
        rowKey="id"
        loading={!contacts.length}
      /> */}
      <Modal
        title={form.getFieldValue("id") ? "Edit Contact" : "Add Contact"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={addOrUpdateContact} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Last Name">
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Некорректный email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="number"
            label="Phone"
            rules={[{ required: true, message: "Введите номер телефона" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Contacts;
