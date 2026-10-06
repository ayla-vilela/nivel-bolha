import { useEffect, useState } from "react";
import {
  ImageBackgroundComponent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Accelerometer } from "expo-sensors";

export default function App() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let assinatura;
    let ativo = true;

    async function iniciarSensor() {
      try {
        const disponivel = await Accelerometer.isAvailableAsync();
        if (!ativo) return;
        if (!disponivel) {
          setErro("Sensor indisponível. Abra em um celular físico.");
          return;
        }

        Accelerometer.setUpdateInterval(100);
        assinatura = Accelerometer.addListener((Leitura) => {
          if (ativo) setDados(Leitura);
        });
      } catch {
        if (ativo) setErro("Não foi possível acessar o sensor. Reabra o app.");
      }
    }

    iniciarSensor();

    return () => {
      ativo = false;
      assinatura?.remove();
    };
  }, []);

  const x = dados?.x ?? 0;
  const y = dados?.y ?? 0;
  const nivelado = dados !== null && Math.abs(x) < 0.04 && Math.abs(y) < 0.04;
  const cor = nivelado ? "#22c55e" : "#facc15";

  const deslocamentoX = x * 180;
  const deslocamentoY = y * 180;
  const distancia = Math.hypot(deslocamentoX, deslocamentoY);
  const limite = Math.max(1, distancia / 90);

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <StatusBar style="light" />
      <Text style={styles.titulo}>Nível de Bolha</Text>
      <Text style={styles.instrucao}>
        Apoie o celular com a tela para cima. {"\n"}
        Incline devagar e observe a bolha.
      </Text>

      <View style={styles.nivel}>
        <View style={styles.linhaHorizontal} />
        <View style={styles.linhaVertical} />
        <View style={styles.alvo} />
        {dados && !erro && (
          <View
            styles={[
              styles.bolha,
              {
                backgroundColor: cor,
                transform: [
                  { translateX: deslocamentoX / limite },
                  { translatYX: deslocamentoY / limite },
                ],
              },
            ]}
          />
        )}
      </View>
      <Text style={[styles.status, { color: erro ? "#fca5a5" : cor }]}>
        {erro ||
          (!dados
            ? "Aguardando sensor..."
            : nivelado
              ? "Nivelado!"
              : "Inclinado")}
      </Text>
      <Text style={styles.leitura}>
        X:{dados ? x.toFixed(2) : "--"} g | Y: {dados ? y.toFixed(2) : "--"} g
      </Text>
      <Text style={styles.rodape}>
        Bolha verde no centro = celular nivelado
      </Text>
    </ScrollView>
  );
}

//Style dica assim.A bolha  é uma View, sem imgaem externa.

const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: "#0f1728",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "24",
    paddingVertical: 64,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  instrucao: {
    color: " #eff1f2",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 25,
    marginTop: 16,
    marginBottom: 32,
  },
  nivel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  linhaVertical: {
    position: "absolute",
    width: 1,
    height: 216,
    backgroundColor: "#c6d4e7",
  },
  alvo: {
    position: "absolute",
    width: 60,
    height: 60,
  },
  bolha: {
    position: 40,
    height: 40,
    borderRadius: 20,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    fontVariant: ['tabular-nums'],
  },
  rodape: {
    color:'#94a3b8',
    fontSize: 14,
    textAlign:'center',
    marginTop:28
  },

});
