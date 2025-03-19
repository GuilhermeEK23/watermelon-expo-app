import React, { useEffect, useRef, useState } from "react";
import { FlatList, View, Text, Alert } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { Menu, MenuTypeProps } from "../../components/Menu";
import { Skill } from "../../components/Skill";
import { Button } from "../../components/Button";
import { database } from "../../databases";

import { Container, Title, Input, Form, FormTitle } from "./styles";
import { skillModel } from "../../databases/model/skillModel";
import { Q } from "@nozbe/watermelondb";

export function Home() {
  const [type, setType] = useState<MenuTypeProps>("soft");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<skillModel[]>([]);
  const [skill, setSkill] = useState<skillModel>({} as skillModel);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSave = async () => {
    if (skill.id) {
      await database.write(async () => {
        await skill.update((data) => {
          data.name = name;
          data.type = type;
        });
      });

      setSkill({} as skillModel);
    } else {
      await database.write(async () => {
        await database.get<skillModel>("skills").create((data) => {
          data.name = name;
          data.type = type;
        });
      });
    }

    setName("");
    bottomSheetRef.current?.collapse();
    fetchData();
  };

  const handleEdit = async (item: skillModel) => {
    setSkill(item);
    setName(item.name);
    bottomSheetRef.current?.expand();
  };

  const handleRemove = async (item: skillModel) => {
    await database.write(async () => {
      item.destroyPermanently();
    });

    fetchData();
  };

  const fetchData = async () => {
    const skillCollection = database.get<skillModel>("skills");
    const response = await skillCollection.query(Q.where("type", type)).fetch();

    setSkills(response);
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  return (
    <Container>
      <Title>About me</Title>
      <Menu type={type} setType={setType} />

      <FlatList
        data={skills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Skill
            data={item}
            onEdit={() => handleEdit(item)}
            onRemove={() => handleRemove(item)}
          />
        )}
      />

      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={["4%", "35%"]}>
        <BottomSheetView>
          <Form>
            <FormTitle>{skill.id ? "Edit" : "New"}</FormTitle>

            <Input
              placeholder="New skill..."
              onChangeText={setName}
              value={name}
            />

            <Button title="Save" onPress={handleSave} />
          </Form>
        </BottomSheetView>
      </BottomSheet>
    </Container>
  );
}
